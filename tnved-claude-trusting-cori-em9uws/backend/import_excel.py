import logging
import sys
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/tnved"


def import_excel(file_path: str, db_url: str = DATABASE_URL) -> None:
    path = Path(file_path)
    if not path.exists():
        logger.error("Файл не найден: %s", path)
        sys.exit(1)

    logger.info("Чтение файла: %s", path)
    df = pd.read_excel(path, dtype=str)
    df = df.fillna("")

    columns = list(df.columns)
    if len(columns) < 2:
        logger.error("Файл должен содержать минимум 2 колонки")
        sys.exit(1)

    col_code = columns[0]
    col_name = columns[1]
    col_tariff = columns[2] if len(columns) > 2 else None
    col_details = columns[3] if len(columns) > 3 else None
    doc_columns = columns[4:] if len(columns) > 4 else []

    records = []
    for _, row in df.iterrows():
        code = str(row[col_code]).strip()
        if not code:
            continue

        documents = []
        for dc in doc_columns:
            val = str(row[dc]).strip()
            if val:
                documents.append(val)

        records.append({
            "code": code,
            "name": str(row[col_name]).strip(),
            "tariff": str(row[col_tariff]).strip() if col_tariff else None,
            "details": str(row[col_details]).strip() if col_details else None,
            "documents": documents,
        })

    logger.info("Подготовлено записей: %d", len(records))

    engine = create_engine(db_url)

    with engine.begin() as conn:
        conn.execute(text("DELETE FROM tnved"))

        for rec in records:
            conn.execute(
                text(
                    "INSERT INTO tnved (code, name, tariff, details, documents) "
                    "VALUES (:code, :name, :tariff, :details, :documents::jsonb) "
                    "ON CONFLICT (code) DO UPDATE SET "
                    "name = EXCLUDED.name, tariff = EXCLUDED.tariff, "
                    "details = EXCLUDED.details, documents = EXCLUDED.documents"
                ),
                {
                    "code": rec["code"],
                    "name": rec["name"],
                    "tariff": rec["tariff"],
                    "details": rec["details"],
                    "documents": str(rec["documents"]).replace("'", '"'),
                },
            )

    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM tnved")).scalar()
        logger.info("Импортировано записей: %d", count)

    engine.dispose()
    logger.info("Импорт завершён")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python import_excel.py <путь_к_файлу.xlsx>")
        sys.exit(1)

    db = sys.argv[2] if len(sys.argv) > 2 else DATABASE_URL
    import_excel(sys.argv[1], db)
