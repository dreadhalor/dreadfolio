import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  getDocs,
  connectFirestoreEmulator,
  terminate,
  query,
  collection,
} from 'firebase/firestore';
import fs from 'fs';
import firebaseConfig from '@repo/config/firebase-config.js';
import { program } from 'commander';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const exportData = async (collectionName, outputFile) => {
  try {
    const collectionRef = query(collection(db, collectionName));
    const snapshot = await getDocs(collectionRef);
    const data = {};
    snapshot.forEach((doc) => {
      data[doc.id] = doc.data();
    });
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log('Data exported successfully!');
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await terminate(db); // Close the Firestore instance or it will hang in the terminal
  }
};

program
  .description('Export Firestore collection data to a JSON file')
  .option('-c, --collection <name>', 'Name of the Firestore collection')
  .option('-o, --output <file>', 'Output file path')
  .option('--prod', 'Run in production mode')
  .parse(process.argv);

const { collection: collectionName, output: outputFile, prod } = program.opts();

if (!collectionName || !outputFile) {
  console.error('Error: Collection name and output file are required.');
  program.help();
}

if (!prod) {
  // Connect to Firestore Emulator
  connectFirestoreEmulator(db, 'localhost', 8080);
}

exportData(collectionName, outputFile);
