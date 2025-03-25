async function fetchData() {
  const data = await fetch("/api/data");
  return data;
}
