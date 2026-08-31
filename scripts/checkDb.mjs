import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve('firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const app = initializeApp(firebaseConfig);

async function checkDatabases() {
  console.log("Checking named database:", firebaseConfig.firestoreDatabaseId);
  try {
    const namedDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    const prodSnap = await getDocs(collection(namedDb, 'products'));
    console.log(`Named DB '${firebaseConfig.firestoreDatabaseId}' -> products count:`, prodSnap.size);
    const custSnap = await getDocs(collection(namedDb, 'customers'));
    console.log(`Named DB '${firebaseConfig.firestoreDatabaseId}' -> customers count:`, custSnap.size);
    const salesSnap = await getDocs(collection(namedDb, 'sales'));
    console.log(`Named DB '${firebaseConfig.firestoreDatabaseId}' -> sales count:`, salesSnap.size);
  } catch (err) {
    console.error("Error with named DB:", err.message);
  }

  console.log("\nChecking default database '(default)':");
  try {
    const defaultDb = getFirestore(app); // default database
    const prodSnap = await getDocs(collection(defaultDb, 'products'));
    console.log(`Default DB '(default)' -> products count:`, prodSnap.size);
    const custSnap = await getDocs(collection(defaultDb, 'customers'));
    console.log(`Default DB '(default)' -> customers count:`, custSnap.size);
    const salesSnap = await getDocs(collection(defaultDb, 'sales'));
    console.log(`Default DB '(default)' -> sales count:`, salesSnap.size);
  } catch (err) {
    console.log("Default DB check message:", err.message);
  }
}

checkDatabases();
