"""Command line trainer.

    python -m app.ml.train             # train on synthetic starter data
    python -m app.ml.train --from-db   # train on real labelled enquiries if there are enough
"""
import argparse
import json

from app.ml.model import train_and_save
from app.ml.synthetic import generate_synthetic


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the admission conversion model.")
    parser.add_argument("--from-db", action="store_true", help="use labelled enquiries from the database")
    args = parser.parse_args()

    if args.from_db:
        from app.database import SessionLocal
        from app.services.scoring import build_training_frame

        with SessionLocal() as db:
            df, source = build_training_frame(db)
    else:
        df, source = generate_synthetic(), "synthetic"

    meta = train_and_save(df, data_source=source)
    print(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()
