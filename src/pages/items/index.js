import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const Items = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const response = await axios.get('/api/items');
      setItems(response.data.data);
    };

    fetchItems();
  }, []);

  return (
    <div>
      <h1>Items</h1>
      <Link href="/items/create">Create New Item</Link>
      <ul>
        {items.map(item => (
          <li key={item._id}>
            <Link href={`/items/${item._id}`}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Items;
