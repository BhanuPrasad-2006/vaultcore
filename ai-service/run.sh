name=ai-service/run.sh

#!/bin/bash
echo "Starting VaultCore AI Service..."
pip install -r requirements.txt
python main.py