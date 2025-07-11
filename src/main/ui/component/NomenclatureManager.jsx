import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NomenclatureManager = () => {
    const [nomenclatures, setNomenclatures] = useState([]);
    const [newName, setNewName] = useState('');
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const addNomenclature = async () => {
        if (!newName.trim()) return;
        try {
            const response = await axios.post('http://localhost:8080/api/nomenclature', { name: newName });
            const newNomenclature = response.data;
            setNomenclatures(prev => {
                const updated = [...prev, newNomenclature];
                updated.sort((a, b) => a.name.localeCompare(b.name));
                return updated;
            });
            setNewName('');
            setMessage(`Номенклатура "${newNomenclature.name}" добавлена`)
        }
        catch (e) {
            if (e.response.status === 409)
                setMessage(e?.response?.data);
            else
                setMessage(e?.response?.data || 'Ошибка при изменении');
        }
    };

    const updateNomenclature = async (id, name) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/nomenclature/${id}`, {
                name: name
            });
            const updNomenclature = response.data;
            setNomenclatures(prev => prev.map (n => n.id === id ? updNomenclature : n));
            setMessage(`"${updNomenclature.name}" успешно обновлено`);
            setEditingId(null);
            setNewName('');
        }
        catch (e) {
            if (e.response.status === 409)
                setMessage(e?.response?.data);
            else
                setMessage(e?.response?.data || 'Ошибка при изменении');
        }
    }

    const deleteNomenclature = async (id, name) => {
        try {
            await axios.delete(`http://localhost:8080/api/nomenclature/${id}`);
            setNomenclatures(prev => prev.filter(eq => eq.id !== id));
            setMessage(`Номенклатура "${name}" удалена`);
        }
        catch (e) {
            setMessage(e?.response?.data || 'Ошибка при удалении');
        }
    }

    useEffect(() => {
        const fetchNomenclatures = async () => {
            const data = await getNomenclatures();
            setNomenclatures(data);
        };
        fetchNomenclatures();
    }, []);

    return (
        <div className="body">
            <h2>Номенклатура ТМЦ</h2>

            <div className="form-row">
                <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Название номенклатуры"
                />
                <button className="btn" onClick={addNomenclature}>Добавить</button>
            </div>

            {message && <p>{message}</p>}

            {
                nomenclatures.length === 0 ? (
                    <p>Список номенклатур пустой</p>
                ) : (
                    <table className="table">
                        {
                            nomenclatures.map((n, index) => (
                                <tr key={n.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {
                                            editingId === n.id
                                                ? <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    placeholder={"Название"}
                                                />
                                                : n.name
                                        }
                                    </td>
                                    <td>
                                        {
                                            editingId === n.id
                                                ? <button className="btn" onClick={() => updateNomenclature(n.id, editName)}>
                                                    Сохранить
                                                </button>
                                                : <button className="btn" onClick={() => {
                                                    setEditingId(n.id)
                                                    setEditName(n.name)
                                                }}>
                                                    Изменить
                                                </button>
                                        }
                                    </td>
                                    <td>
                                        {
                                            editingId === n.id
                                                ? <button className="btn" onClick={() => setEditingId(null)}>
                                                    Отмена
                                                </button>
                                                : <button className="btn btn-danger" onClick={() => deleteNomenclature(n.id, n.name)}>Удалить</button>
                                        }
                                    </td>
                                </tr>
                            ))
                        }
                    </table>
                )
            }
        </div>
    );
}
export default NomenclatureManager;

export const getNomenclatures = async () => {
    try {
        const response = await axios.post('http://localhost:8080/api/nomenclature');
        return response.data;
    } catch (error) {
        console.error('Ошибка при загрузке номенклатур', error);
        return [];
    }
};