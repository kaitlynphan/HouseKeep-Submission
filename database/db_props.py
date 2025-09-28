# db_props.py
import sqlite3
import json
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

DB_PATH = Path("mydatabase.db")
SCHEMA_PATH = Path("schema.sql")

def get_connection(row_factory=None):
    conn = sqlite3.connect(DB_PATH.as_posix(), detect_types=sqlite3.PARSE_DECLTYPES|sqlite3.PARSE_COLNAMES)
    if row_factory:
        conn.row_factory = row_factory
    return conn

def init_db():
    """Run schema.sql to create tables, and ensure RawProperties exists."""
    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"{SCHEMA_PATH} not found")

    sql = SCHEMA_PATH.read_text()

    # run schema.sql
    conn = get_connection()
    try:
        conn.executescript(sql)
        # Create RawProperties table if it wasn't in schema.sql
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS RawProperties (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            home_id TEXT,
            source TEXT,
            raw_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(home_id) REFERENCES Homes(id) ON DELETE CASCADE
        );
        """)
        conn.commit()
    finally:
        conn.close()

# ---------- Users helper ----------
def find_user_by_phone_or_name(phone_e164: Optional[str], display_name: Optional[str]) -> Optional[str]:
    conn = get_connection(row_factory=sqlite3.Row)
    try:
        cur = conn.cursor()
        if phone_e164:
            cur.execute("SELECT id FROM Users WHERE phone_e164 = ?", (phone_e164,))
            r = cur.fetchone()
            if r:
                return r["id"]
        if display_name:
            cur.execute("SELECT id FROM Users WHERE display_name = ?", (display_name,))
            r = cur.fetchone()
            if r:
                return r["id"]
        return None
    finally:
        conn.close()

def create_user(display_name: str, phone_e164: Optional[str] = None) -> str:
    """Insert a user and return user.id"""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("INSERT INTO Users (display_name, phone_e164) VALUES (?, ?)", (display_name, phone_e164))
        conn.commit()
        # fetch the generated id via rowid
        rowid = cur.lastrowid
        cur.execute("SELECT id FROM Users WHERE rowid = ?", (rowid,))
        return cur.fetchone()[0]
    finally:
        conn.close()

# ---------- Homes / RawProperties helpers ----------
def find_home_by_address_for_user(user_id: str, address_text: str) -> Optional[str]:
    conn = get_connection(row_factory=sqlite3.Row)
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM Homes WHERE user_id = ? AND address_text = ?", (user_id, address_text))
        r = cur.fetchone()
        return r["id"] if r else None
    finally:
        conn.close()

def insert_home(user_id: str,
                address_text: str,
                latitude: Optional[float],
                longitude: Optional[float],
                building_type: Optional[str],
                year_built: Optional[int],
                bedrooms: Optional[int] = None,
                bathrooms: Optional[float] = None,
                created_at: Optional[str] = None) -> str:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO Homes (
                user_id,
                address_text,
                latitude,
                longitude,
                building_type,
                year_built,
                bedrooms,
                bathrooms,
                has_central_ac,
                evac_map_path,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            address_text,
            latitude,
            longitude,
            building_type,
            year_built,
            bedrooms,
            bathrooms,
            0,      # has_central_ac default guess
            None,   # evac_map_path
            created_at,
            created_at
        ))
        conn.commit()
        rowid = cur.lastrowid
        cur.execute("SELECT id FROM Homes WHERE rowid = ?", (rowid,))
        home_id = cur.fetchone()[0]
        return home_id
    finally:
        conn.close()

def insert_raw_property(home_id: Optional[str], raw_json: str, source: str = "attom") -> str:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO RawProperties (home_id, source, raw_json) VALUES (?, ?, ?)
        """, (home_id, source, raw_json))
        conn.commit()
        rowid = cur.lastrowid
        cur.execute("SELECT id FROM RawProperties WHERE rowid = ?", (rowid,))
        return cur.fetchone()[0]
    finally:
        conn.close()

# ---------- Mapping function ----------
def normalize_date(date_str: Optional[str]) -> Optional[str]:
    if not date_str:
        return None
    try:
        # ATTEMPT ISO parse for forms like 2025-08-08
        return datetime.fromisoformat(date_str).isoformat()
    except Exception:
        return date_str

def map_attom_property_to_home_fields(prop: Dict[str, Any]) -> Dict[str, Any]:
    # address_text
    addr = prop.get("address", {})
    address_text = addr.get("oneLine") or ", ".join(filter(None, [addr.get("line1"), addr.get("line2")]))

    # lat/lon
    lat = prop.get("location", {}).get("latitude")
    lon = prop.get("location", {}).get("longitude")
    try:
        latitude = float(lat) if lat is not None else None
        longitude = float(lon) if lon is not None else None
    except Exception:
        latitude = None
        longitude = None

    # year built
    yearbuilt = prop.get("summary", {}).get("yearbuilt")
    try:
        yearbuilt = int(yearbuilt) if yearbuilt is not None else None
    except Exception:
        yearbuilt = None

    # building type mapping (ATTOM often non-residential; map to 'other' by default)
    propclass = (prop.get("summary", {}).get("propclass") or "").lower()
    if propclass in ("apartment", "condo", "house", "townhome"):
        building_type = propclass
    else:
        building_type = "other"

    pub_date = prop.get("vintage", {}).get("pubDate")
    created_at = normalize_date(pub_date)

    # return mapping
    return {
        "address_text": address_text,
        "latitude": latitude,
        "longitude": longitude,
        "building_type": building_type,
        "year_built": yearbuilt,
        "created_at": created_at
    }

# ---------- Top-level import function ----------
def import_property_json_file(user_id: str, json_path: str, store_raw: bool = True) -> str:
    """
    Given a user_id and a path to a JSON file (ATTOM single-property response),
    map fields into Homes and store the raw JSON in RawProperties.
    Returns the Homes.id for the inserted or existing home.
    """
    p = Path(json_path)
    if not p.exists():
        raise FileNotFoundError(f"{json_path} not found")

    raw = p.read_text(encoding="utf-8")
    payload = json.loads(raw)

    # assume the payload has property array with one item
    props = payload.get("property") or []
    if not props:
        raise ValueError("No property items found in JSON")

    prop = props[0]
    mapped = map_attom_property_to_home_fields(prop)
    address_text = mapped["address_text"]

    # find existing home for this user/address
    existing = find_home_by_address_for_user(user_id, address_text)
    if existing:
        home_id = existing
    else:
        home_id = insert_home(
            user_id=user_id,
            address_text=address_text,
            latitude=mapped["latitude"],
            longitude=mapped["longitude"],
            building_type=mapped["building_type"],
            year_built=mapped["year_built"],
            created_at=mapped["created_at"]
        )

    if store_raw:
        insert_raw_property(home_id, raw, source="attom")

    return home_id
