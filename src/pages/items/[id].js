import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Item = () => {
  const [item, setItem] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        const response = await axios.get(`/api/items/${id}`);
        setItem(response.data.data);
        setName(response.data.data.name);
        setDescription(response.data.data.description);
      };

      fetchItem();
    }
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.put(`/api/items/${id}`, { name, description });
    router.push('/items');
  };

  const handleDelete = async () => {
    await axios.delete(`/api/items/${id}`);
    router.push('/items');
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div>
      <h1>Edit Item</h1>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <button type="submit">Update</button>
      </form>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default Item;
 