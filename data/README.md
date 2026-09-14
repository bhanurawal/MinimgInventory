# Forecast dummy data

Run `node scripts/generate-forecast-dataset.mjs` from the project root to regenerate the checked-in 180-day sample dataset.

The generator is deterministic and models baseline usage, maintenance spikes, higher demand for poor-condition equipment, a small seasonal factor, and occasional anomalies. The CSV contains 180 daily records for each catalog part and is intended for local demos and Excel import.
