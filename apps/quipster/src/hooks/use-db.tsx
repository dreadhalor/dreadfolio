/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  doc,
  updateDoc,
  collection,
  getDoc,
  setDoc,
  getFirestore,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

const useDB = (uid: string) => {
  const firestore = getFirestore();
  const vocabListsCollection = useMemo(
    () => collection(firestore, 'vocabLists'),
    [firestore],
  );
  const wordsCollection = useMemo(
    () => collection(firestore, 'words'),
    [firestore],
  );

  const subscribeToVocabLists = useCallback(
    (callback: (_vocabLists: any) => void) => {
      const vocabListsQuery = query(
        vocabListsCollection,
        where('createdBy', '==', uid),
      );
      return onSnapshot(vocabListsQuery, (querySnapshot) => {
        const vocabLists = querySnapshot.docs.map((doc) => doc.data());
        callback(vocabLists);
      });
    },
    [uid, vocabListsCollection],
  );

  const subscribeToWords = useCallback(
    (callback: (_words: any) => void) => {
      const wordsQuery = query(wordsCollection);
      return onSnapshot(wordsQuery, (querySnapshot) => {
        const words = querySnapshot.docs.map((doc) => doc.data());
        callback(words);
      });
    },
    [wordsCollection],
  );

  const createList = async (name: string) => {
    const id = uuidv4();
    const listRef = doc(vocabListsCollection, id);
    await setDoc(listRef, { id, name, createdBy: uid });
  };

  const saveWord = async (word: any) => {
    const wordRef = doc(wordsCollection, word.id);
    await setDoc(wordRef, word);
  };

  const addTermToList = async (listId: string, term: string) => {
    const listRef = doc(vocabListsCollection, listId);
    const listDoc = await getDoc(listRef);
    if (!listDoc.exists()) {
      throw new Error('List does not exist');
    }
    const listData = listDoc.data();
    const terms = listData.terms || [];
    terms.push(term);
    await updateDoc(listRef, { terms });
  };

  const removeTermFromList = async (listId: string, term: string) => {
    const listRef = doc(vocabListsCollection, listId);
    const listDoc = await getDoc(listRef);
    if (!listDoc.exists()) {
      throw new Error('List does not exist');
    }
    const listData = listDoc.data();
    const terms = listData.terms || [];
    const newTerms = terms.filter((t: string) => t !== term);
    await updateDoc(listRef, { terms: newTerms });
  };

  // const transferFiles = async (localUid: string, remoteUid: string) => {
  //   const filesQuery = query(
  //     filesCollection,
  //     where('uploadedBy', '==', localUid),
  //   );
  //   const snapshot = await getDocs(filesQuery);
  //   const batch = writeBatch(firestore);

  //   snapshot.docs.forEach((document) => {
  //     const fileRef = doc(firestore, 'files', document.id);
  //     batch.update(fileRef, { uploadedBy: remoteUid });
  //   });

  //   await batch.commit();
  // };

  // const verifyOwner = async (file_id: string) => {
  //   const fileRef = doc(firestore, 'files', file_id);
  //   const docSnapshot = await getDoc(fileRef);

  //   if (!docSnapshot.exists()) {
  //     throw new Error(`File with id ${file_id} does not exist`);
  //   }

  //   const fileData = docSnapshot.data() as CustomFile;

  //   if (fileData.uploadedBy !== uid) {
  //     throw new Error('Unauthorized operation.');
  //   }

  //   return fileData;
  // };

  // const fetchFiles = async (): Promise<CustomFile[]> => {
  //   const filesQuery = query(filesCollection, where('uploadedBy', '==', uid));
  //   const snapshot = await getDocs(filesQuery);
  //   return snapshot.docs.map((doc) => doc.data() as CustomFile);
  // };

  // const createFile = async (file: CustomFileFields): Promise<CustomFile> => {
  //   const authorizedFile = { ...file, uploadedBy: uid };
  //   const newFile = buildNewFile(authorizedFile);
  //   const docRef = doc(filesCollection, newFile.id);
  //   await setDoc(docRef, newFile);
  //   return newFile;
  // };

  // const renameFile = async (
  //   file_id: string,
  //   name: string,
  // ): Promise<CustomFile> => {
  //   const fileData = await verifyOwner(file_id);
  //   const fileRef = doc(firestore, 'files', file_id);
  //   await updateDoc(fileRef, { name });
  //   return { ...fileData, name };
  // };

  // const moveFile = async (
  //   file_id: string,
  //   parent_id: string | null,
  // ): Promise<CustomFile> => {
  //   const fileData = await verifyOwner(file_id);
  //   const fileRef = doc(firestore, 'files', file_id);
  //   await updateDoc(fileRef, { parent: parent_id });
  //   return { ...fileData, parent: parent_id };
  // };

  // // wow turned into a lot of code for a simple operation
  // const deleteFiles = async (file_ids: string[]): Promise<string[]> => {
  //   // The ids of the files that were successfully deleted
  //   const deleted_files = [];
  //   // The ids of the files that failed to delete
  //   const deletion_failures = [];

  //   // Chunk the file_ids array into sub-arrays of 500 or fewer elements (per firestore docs)
  //   // this does mean the snapshot listener will be called multiple times with 500+ item deletions,
  //   // but come on I'm not implementing a semaphore here who is going to delete 500+ files at once
  //   const chunkSize = 500;
  //   for (let i = 0; i < file_ids.length; i += chunkSize) {
  //     const fileIdsChunk = file_ids.slice(i, i + chunkSize);
  //     const batch = writeBatch(firestore);

  //     for (const file_id of fileIdsChunk) {
  //       try {
  //         await verifyOwner(file_id);
  //         const fileRef = doc(firestore, 'files', file_id);
  //         batch.delete(fileRef);
  //         deleted_files.push(file_id);
  //       } catch (error) {
  //         console.error(`Failed to delete file with id ${file_id}: ${error}`);
  //         deletion_failures.push(file_id);
  //       }
  //     }

  //     try {
  //       await batch.commit();
  //     } catch (error) {
  //       console.error(`Failed to commit batch delete: ${error}`);
  //       // When batch delete fails, we consider all files in this batch as not deleted
  //       // So we need to move them from filesToDelete to failedToDelete
  //       deleted_files.splice(
  //         deleted_files.indexOf(fileIdsChunk[0]!),
  //         fileIdsChunk.length,
  //       );
  //       deletion_failures.push(...fileIdsChunk);
  //     }
  //   }

  //   // return only the successfully deleted files
  //   return deleted_files;
  // };

  // const createFolder = async (
  //   name: string,
  //   parent: string | null,
  // ): Promise<CustomFile> => {
  //   const authorizedFolder = buildNewFolder({ name, parent, uid });
  //   const docRef = doc(filesCollection, authorizedFolder.id);
  //   await setDoc(docRef, authorizedFolder);
  //   return authorizedFolder;
  // };

  // const subscribeToFiles = (callback: (files: CustomFile[]) => void) => {
  //   const filesQuery = query(filesCollection, where('uploadedBy', '==', uid));
  //   return onSnapshot(filesQuery, (querySnapshot) => {
  //     const files = querySnapshot.docs.map((doc) => doc.data() as CustomFile);
  //     callback(files);
  //   });
  // };

  return {
    subscribeToVocabLists,
    subscribeToWords,
    createList,
    addTermToList,
    removeTermFromList,
    saveWord,
  };
};

export { useDB };
