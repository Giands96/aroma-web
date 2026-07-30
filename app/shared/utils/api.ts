import axios from "axios";

const api = axios.create();

const response = await axios.get(
  "https://jsonplaceholder.typicode.com/posts/1"
);

console.log(response.data);