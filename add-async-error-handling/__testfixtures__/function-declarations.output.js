async function fetchData() {
  try {
    const data = await fetch("/api/data");
    return data;
  } catch (err) {
    console.error(err);
  }
}
