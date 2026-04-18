async function test() {
  try {
    const res = await fetch('http://localhost:4000/api/comics');
    const data = await res.json();
    console.log(JSON.stringify(data.data.slice(0, 2), null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
