import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  connectFirestoreEmulator,
  terminate,
} from 'firebase/firestore';
import fs from 'fs';
import firebaseConfig from '@repo/config/firebase-config.js';
import { program } from 'commander';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const importData = async (jsonFile, collectionName) => {
  try {
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    await importCollection(data, collectionName);
    console.log('Data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await terminate(db); // Close the Firestore instance or it will hang in the terminal
  }
};

const importCollection = async (data, collectionName, parentDocRef = null) => {
  try {
    const collectionRef = parentDocRef
      ? collection(parentDocRef, collectionName)
      : collection(db, collectionName);

    const promises = Object.keys(data).map(async (docId) => {
      const docData = data[docId];
      const docRef = doc(collectionRef, docId);

      const subCollectionPromises = Object.keys(docData)
        .filter((field) => typeof docData[field] === 'object')
        .map((field) => importCollection(docData[field], field, docRef));

      await Promise.all(subCollectionPromises);

      const fieldsToWrite = Object.fromEntries(
        Object.entries(docData).filter(
          ([field]) => typeof docData[field] !== 'object',
        ),
      );

      return setDoc(docRef, fieldsToWrite);
    });

    await Promise.all(promises).then(() => {
      console.log('Data imported successfully!');
    });
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await terminate(db); // Close the Firestore instance or it will hang in the terminal
  }
};

program
  .description('Import data from a JSON file to a Firestore collection')
  .option('-f, --file <path>', 'Path to the JSON file')
  .option('-c, --collection <name>', 'Name of the Firestore collection')
  .option('--prod', 'Run in production mode')
  .parse(process.argv);

const { file: jsonFile, collection: collectionName, prod } = program.opts();

if (!jsonFile || !collectionName) {
  console.error('Error: JSON file path and collection name are required.');
  program.help();
  process.exit(1);
}

if (!prod) {
  // Connect to Firestore Emulator
  connectFirestoreEmulator(db, 'localhost', 8080);
}

importData(jsonFile, collectionName);
