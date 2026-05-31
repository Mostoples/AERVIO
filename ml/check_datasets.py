import kaggle, os, pandas as pd, io
kaggle.api.authenticate()

TMPDIR = r'C:\Users\mosto\Desktop\aervio\data\_tmp_check'
os.makedirs(TMPDIR, exist_ok=True)

candidates = [
    'mujtabamatin/air-quality-and-pollution-assessment',
    'hasibalmuzdadid/global-air-pollution-dataset',
    'waqi786/global-air-quality-dataset',
    'tfisthis/global-air-quality-and-respiratory-health-outcomes',
    'kanchana1990/world-air-quality-data-2024-updated',
]

for dataset_id in candidates:
    print('=' * 55)
    print(f'Dataset: {dataset_id}')
    try:
        files = kaggle.api.dataset_list_files(dataset_id)
        csv_files = [f for f in files.files if str(f.name).endswith('.csv')]
        print(f'  CSV files: {[f.name for f in csv_files]}')
        if not csv_files:
            print('  No CSV files found')
            continue

        # Download first CSV only
        owner, name = dataset_id.split('/')
        dl_dir = os.path.join(TMPDIR, name)
        os.makedirs(dl_dir, exist_ok=True)
        kaggle.api.dataset_download_files(dataset_id, path=dl_dir, unzip=True, quiet=True)

        # Read first CSV
        csv_path = None
        for root, dirs, ffiles in os.walk(dl_dir):
            for fname in ffiles:
                if fname.endswith('.csv'):
                    csv_path = os.path.join(root, fname)
                    break
            if csv_path:
                break

        if csv_path:
            df = pd.read_csv(csv_path, nrows=5000)
            print(f'  Shape (5000 rows): {df.shape}')
            print(f'  Columns: {list(df.columns)}')
            # Look for class/category columns
            for col in df.columns:
                if any(kw in col.lower() for kw in ['class', 'category', 'level', 'quality', 'impact', 'aqi_cat', 'status']):
                    print(f'  [{col}] dist:', df[col].value_counts().to_dict())
    except Exception as e:
        print(f'  ERROR: {e}')
    print()
