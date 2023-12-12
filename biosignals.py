import os
from flask import Flask, render_template, request
import mne
import scipy.io
import pandas as pd
import numpy as np
from scipy.io import loadmat

app = Flask(__name__, static_folder='static')

# Define a directory to store uploaded files
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Store the original EEG plot
original_plot = None
scaling_factor = 1.0

# Route to render the file upload form
@app.route('/')
def file_upload_form():
    return render_template('upload.html')

# Route to handle file upload and generate the EEG plot
@app.route('/upload', methods=['POST'])
def upload_file():
    global original_plot
    if 'file' not in request.files:
        return 'No file part'
    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return 'No selected file'

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file.filename)
    uploaded_file.save(file_path)

    # Check file extension
    file_extension = os.path.splitext(uploaded_file.filename)[1].lower()

    # Read data based on file extension
    if file_extension == '.edf':
        raw = mne.io.read_raw_edf(file_path)
        if 'eeg' in raw:
            raw.pick_types(eeg=True)
            data, times = raw[:, :]

            data_list = data[0, :].tolist()
            times_list = times.tolist()
            data_json = {"y": data_list, "x": times_list}

            # Render the EEG plot template with the data
            return render_template('eeg_plot.html', scaling_factor=scaling_factor, plot=original_plot, data_json=data_json)

        else:
            return 'No EEG data found in the file'
    elif file_extension == '.mat':
        data = loadmat(file_path)

        test_sample = data['p']


        temp_mat = test_sample[0, 999]
        temp_length = temp_mat.shape[1]
        sample_size = 125





        sample_size = 125
        ppg = []
        for i in range(1000):
            temp_mat = test_sample[0, i]
            temp_length = temp_mat.shape[1]
            for j in range((int)(temp_length/sample_size)):
                temp_ppg = temp_mat[0, j*sample_size:(j+1)*sample_size]
                ppg.append(temp_ppg)
                
        ecg = []
        bp = []
        sbp = [] #Systolic Blood Pressure
        dbp = [] #Diastolic Blood Pressue
        size = 125 #sample size

        for i in range(1000):
            temp_mat = test_sample[0, i]
            temp_length = temp_mat.shape[1]
            for j in range((int)(temp_length/sample_size)):
                temp_ecg = temp_mat[2, j*size:(j+1)*size]
                temp_bp = temp_mat[1, j*size:(j+1)*size]
                
                max_value = max(temp_bp)
                min_value = min(temp_bp)
                
                sbp.append(max_value)
                dbp.append(min_value)
                ecg.append(temp_ecg)
                bp.append(temp_bp)
                
        # Reshaping the ecg, ppg and bp signal data into column vectors
        ppg, ecg, bp = np.array(ppg).reshape(-1,1), np.array(ecg).reshape(-1,1), np.array(bp).reshape(-1,1)
        sbp, dbp = np.array(sbp).reshape(-1,1), np.array(dbp).reshape(-1,1)
        
        
        x_values = list(range(1, 2000))

    # Get the corresponding 125 values from the ECG data for the y-axis
        y_values = ecg[:2000].flatten().tolist()

    # Create data_json dictionary
        data_json = {"x": x_values, "y": y_values}
        
        #data = scipy.io.loadmat(file_path)
        # Extract data and times from the .mat file (update based on your .mat file structure)
        #eeg_data = data['eeg_data']
        #times = data['times']
        #raw = mne.io.RawArray(eeg_data, info=mne.create_info(ch_names=['EEG'], sfreq=1 / (times[0, 1] - times[0, 0]), ch_types=['eeg']))
        
        if data_json:
            #raw.pick_types(eeg=True)
            #data, times = raw[:, :]

            #data_list = data[0, :].tolist()
            #times_list = times.tolist()
            #data_json = {"y": data_list, "x": times_list}

            # Render the EEG plot template with the data
            
            return render_template('eeg_plot.html', scaling_factor=scaling_factor, plot=original_plot, data_json=data_json)

        else:
            return 'No EEG data found in the file'
    elif file_extension == '.csv':
        # Read CSV file into a Pandas DataFrame (update based on your CSV file structure)
        df = pd.read_csv(file_path)
        #print(df.columns)
        #return 'see columns'
        # Extract data and times from the DataFrame (update based on your DataFrame structure)
        df["'V1'"] = pd.to_numeric(df["'V1'"], errors='coerce')
        df = df.dropna(subset=["'V1'"])
        eeg_data = df["'V1'"].values
        
        df["'Elapsed time'"] = pd.to_numeric(df["'Elapsed time'"], errors='coerce')
        df = df.dropna(subset=["'Elapsed time'"])
        times = df["'Elapsed time'"].values
        #print(eeg_data, times)
        #raw = mne.io.RawArray(eeg_data, info=mne.create_info(ch_names=['EEG_Channel1', 'EEG_Channel2', 'EEG_Channel3'], sfreq=1 / (times[1] - times[0]), ch_types=['eeg'] * 3))
        if eeg_data.any():
            #raw.pick_types(eeg=True)
            #data, times = raw[:, :]
               
            data_list = eeg_data.tolist()
            times_list = times.tolist()
            data_json = {"y": data_list, "x": times_list}

            # Render the EEG plot template with the data
            return render_template('eeg_plot.html', scaling_factor=scaling_factor, plot=original_plot, data_json=data_json)

        else:
            return 'No EEG data found in the file'
    else:
        return 'Invalid or unsupported file format'

    

if __name__ == '__main__':

    app.run(host='0.0.0.0', port=5000)
