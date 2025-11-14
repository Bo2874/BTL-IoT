import { useEffect, useState } from "react";

export default function useFetch(callback, deps = []) {
  const [data, setData] = useState(null);

  useEffect(() => {
    callback().then(res => setData(res));
  }, deps);

  return data;
}
