import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NomenclatureManager = () => {
    const [nomenclatures, setNomenclatures] = useState([]);
    const [newName, setNewName] = useState('');
    const [message, setMessage] = useState('');

    const getNomenclatures = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/nomenclature');
            setNomenclatures(response.data.data);
            setMessage(response.data.response);
        } catch (error) {
            console.error('Ошибка при загрузке номенклатур', error);
        }
    };
    const addNomenclature = async () => {
        if (!newName.trim()) return;

        try {
            const response = await axios.post('http://localhost:8080/api/nomenclature', { name: newName });
            setMessage(response.data);
            setNewName('');
            getNomenclatures();
        } catch (error) {
            setMessage(error?.response?.data || 'Ошибка при добавлении');
        }
    };

    useEffect(() => {
        getNomenclatures();
    }, []);
    return (
        <div style={{ padding: '1rem' }}>
            <h2>Номенклатура ТМЦ</h2>

            <div>
                <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Название номенклатуры"
                />
                <button onClick={addNomenclature}>Добавить</button>
            </div>

            {message && <p>{message}</p>}

            <ul>
                {nomenclatures.map(n => (
                    <li key={n.id}>{n.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default NomenclatureManager;