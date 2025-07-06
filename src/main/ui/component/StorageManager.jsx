import React, {useEffect, useState} from 'react';
import axios from 'axios';


const StorageManager = () => {
    const [equipments, setEquipments] = useState([]);
    const [equipmentName, setEquipmentName] = useState('');
    const [equipmentAmount, setEquipmentAmount] = useState('');
    const [message, setMessage] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingAmount, setEditingAmount] = useState(null);

    const getEquipments = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/equipment');
            setEquipments(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке остатков', error);
        }
    };

    const addEquipment = async () => {
        if (!equipmentName.trim() || !equipmentAmount.trim()) return;

        try {
            const response = await axios.post('http://localhost:8080/api/equipment', {
                name: equipmentName,
                amount: equipmentAmount
            });
            const newEquipment = response.data;
            setEquipments(prev => [...prev, newEquipment]);
            resetForm();
            setMessage(`"${newEquipment.name}" добавлено`);
        }
        catch (e) {
            setMessage(e?.response?.data || 'Ошибка при добавлении');
            if (e.response.status === 409) //если существует в списке
                resetForm();
        }
    };

    const updateEquipment = async (id, newAmount, name) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/equipment/${id}`, {
                name: name,
                amount: newAmount
            });
            const updatedEquipment = response.data;
            setEquipments(prev => prev.map(eq => eq.id === id ? updatedEquipment : eq));
            setMessage(`"${name}" успешно обновлено`);
            setEditingId(null);
            setEditingAmount(null);
        } catch (e) {
            setMessage(e?.response?.data || 'Ошибка при изменении');
        }
    };

    const deleteEquipment = async (id, name) => {
        try {
            await axios.delete(`http://localhost:8080/api/equipment/${id}`);
            setEquipments(prev => prev.filter(eq => eq.id !== id));
            setMessage(`Оборудование "${name}" удалено`);
        }
        catch (e) {
            setMessage(e?.response?.data || 'Ошибка при удалении');
        }
    }

    const resetForm = () => {
        setEquipmentName('');
        setEquipmentAmount('');
        setShowAddForm(false);
    }

    useEffect(() => {
        getEquipments();
    }, []);

    return (
        <div>
            <h1>Корректировка остатков на складе</h1>
            {!showAddForm && (
                <button onClick={() => {
                    setShowAddForm(true)
                    setEditingId(null)
                    setEditingAmount(null)
                }}>Добавить</button>
            )}

            {showAddForm && (
                <div>
                    <input
                        type="text"
                        value={equipmentName}
                        onChange={e => setEquipmentName(e.target.value)}
                        placeholder="Название ТМЦ"
                    />
                    <input
                        type="text"
                        value={equipmentAmount}
                        onChange={e => setEquipmentAmount(e.target.value)}
                        placeholder="Количество"
                    />
                    <button onClick={addEquipment}>Добавить</button>
                    <button onClick={() => {
                        setMessage('')
                        setShowAddForm(false)
                    }}>Отмена</button>
                </div>
            )}

            {message && (
                <div>
                    <p>{message} <button onClick={() => setMessage('')}>X</button></p>
                </div>
            )}
            { equipments.length === 0 ? (
                <p>Склад пустой</p>
            ) : (
                <table>
                    {equipments.map((e, index) => (
                        <tr key={e.id}>
                            <td>{index + 1}</td>
                            <td>{e.name}</td>
                            <td>
                                {
                                    editingId === e.id
                                        ? <input
                                            type="text"
                                            value={editingAmount}
                                            onChange={e => setEditingAmount(e.target.value)}
                                            placeholder={"Количество"}
                                        />
                                        : e.amount
                                }
                            </td>
                            <td>
                                {
                                    editingId === e.id
                                        ? <button onClick={() => updateEquipment(e.id, editingAmount, e.name)}>
                                            Сохранить
                                        </button>
                                        : <button onClick={() =>
                                        {
                                            setShowAddForm(false)
                                            setEditingAmount(e.amount)
                                            setEditingId(e.id)
                                        }}>
                                            Изменить
                                        </button>
                                }
                            </td>
                            <td>
                                {
                                    editingId === e.id
                                        ? <button onClick={() => setEditingId(null)}>
                                            Отмена
                                        </button>
                                        : <button onClick={() => deleteEquipment(e.id, e.name)}>Удалить</button>
                                }
                            </td>
                        </tr>
                    ))}
                </table>
                )}
        </div>
    );
}

export default StorageManager;