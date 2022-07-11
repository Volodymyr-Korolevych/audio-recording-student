// this module implements access to Server Side API:
// - /records - load list of audio files kept on the server
// - /save    - save audio file with given name and refresh file list 
// - /remove  - remove audio file with given name and refresh file list
//
export const fetchRecords = async () => {
  try {
    const files = await (await fetch("/records")).json();
    return files;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export const saveAudioRecord = async (data) => {
  try {
    await fetch("/save", { method: "POST", body: data })
  } catch (err) {
    console.error(err);
  }
  return await fetchRecords();
}

export const removeAudioFile = async (fileName) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: fileName }),
  }
  await fetch("/remove", requestOptions);
  return await fetchRecords();
}