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
            setEquipments(prev => [...prev, newEquipment])
            resetForm();
            setMessage(`${newEquipment.name} добавлено`);
        }
        catch (e) {
            setMessage(e?.response?.data || 'Ошибка при добавлении');
            if (e.response.status === 409)
                resetForm();
        }
    };

    const updateEquipment = async (id, newAmount) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/equipment/${id}`, {
                amount: newAmount
            });
            setMessage(response.data);
            setEditingId(null);
            setEditingAmount(null);
            getEquipments();
        } catch (e) {
            setMessage(e?.response?.data || 'Ошибка при изменении');
        }
    };

    const deleteEquipment = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:8080/api/equipment/${id}`);
            setMessage(response.data);
            getEquipments();
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
            )
            }


            {message && <p>{message}</p>}

            <table>
                {equipments.map((e, index) => (
                    <tr key={e.id}>
                        <td>{index + 1}</td>
                        <td>{e.name}</td>
                        <td>
                            {
                                editingId !== e.id
                                    ? e.amount
                                    : <input
                                        type="text"
                                        value={editingAmount}
                                        onChange={e => setEditingAmount(e.target.value)}
                                        placeholder={"Количество"}
                                      />
                            }
                        </td>
                        <td>
                            {
                                editingId === e.id
                                    ? <button onClick={() => updateEquipment(e.id, editingAmount)}>
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
                                    : <button onClick={() => deleteEquipment(e.id)}>Удалить</button>
                            }
                        </td>
                    </tr>
                ))}
            </table>
        </div>
    );

}

export default StorageManager;