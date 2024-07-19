# Extranet Files Viewer

This project is designed to show Extranet files from the NSE member portal. It involves a series of steps to download, store, and display these files:

1. **Python Script**: Downloads CSV files from the NSE member portal and stores them locally.
2. **Python Scripts for MongoDB**: Uploads the downloaded CSV files to respective MongoDB databases:
   - `otr.py`: Uploads OTR files to MongoDB (OTR).
   - `pnc.py`: Uploads PNC files to MongoDB (PNC).
   - `gsm.py`: Uploads GSM files to MongoDB (GSM).
3. **Node.js Backend**: Connects to MongoDB to make the files available as an API.
4. **React Frontend**: Fetches the data from the API and displays it using a user interface built with React.js.

## Frontend Setup

This project utilizes Create React App for the frontend. Below are some of the available scripts:

### `npm start`

Runs the React app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the React app for production to the `build` folder.\
It bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: This is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc.) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point, you're on your own.

## Learn More

You can learn more about Create React App in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Backend Setup

The backend directory structure includes Node.js scripts for handling data:

### `index.js`

Connects to MongoDB and makes cloud files live as an API.

### `myserver.js`

Makes local machine files live as an API.

### `ftp/`

Contains data folders for downloaded files and Python scripts for file operations:

- `020524/`, `030524/`, `040524/`, etc.: Data folders for respective dates with downloaded CSV files.
- `gsm/`: Data folder for GSM files.
- `otr.py`: Python script for uploading OTR files to MongoDB (OTR).
- `pnc.py`: Python script for uploading PNC files to MongoDB (PNC).
- `gsm.py`: Python script for uploading GSM files to MongoDB (GSM).
- `Extranet_ftp.py`: Python script for downloading files from the NSE Member Portal.

