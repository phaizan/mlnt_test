import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {getNomenclatures} from "./NomenclatureManager";

const StorageManager = () => {
    const [equipments, setEquipments] = useState([]);
    const [equipment, setEquipment] = useState({
        name: '',
        amount: ''
    })
    const [message, setMessage] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingAmount, setEditingAmount] = useState(null);
    const [nomenclatures, setNomenclatures] = useState([]);

    const getEquipments = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/equipment');
            setEquipments(response.data);
        } catch (e) {
            console.error('Ошибка при загрузке остатков: ', e);
        }
    };

    const addEquipment = async () => {
        if (!equipment.name.trim() || !equipment.amount.trim()) return;

        try {
            const response = await axios.post('http://localhost:8080/api/equipment', {
                name: equipment.name,
                amount: equipment.amount
            });
            console.log(response)
            console.log(response.data)
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
            if (newAmount <= '0') {
                setMessage("Неправильное количество")
                return;
            }
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
            if (e.response.status === 410) {
                setMessage(`${name} удалено`)
                setEquipments(prev => prev.filter(eq => eq.id !== id));
            }
            else
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

    const setEquipmentName = (value) => {
        setEquipment(prev => ({...prev, name: value}))
    }

    const setEquipmentAmount = (value) => {
        setEquipment(prev => ({...prev, amount: value}))
    }


    useEffect(() => {
        getEquipments();
        const fetchNomenclatures = async () => {
            const data = await getNomenclatures();
            setNomenclatures(data);
        };
        fetchNomenclatures();
    }, []);

    return (
        <div className="body">
            <h2>Корректировка остатков на складе</h2>

            {!showAddForm && (
                <button className="btn" onClick={() => {
                    setShowAddForm(true);
                    setEditingId(null);
                    setEditingAmount(null);
                }}>
                    Добавить
                </button>
            )}

            {showAddForm && (
                <div className="form-row">
                    <select
                        value={equipment.name}
                        required
                        onChange={e => setEquipmentName(e.target.value)}
                    >
                        <option value="">Выберите ТМЦ</option>
                        {
                            nomenclatures.map(n => (
                                <option key={n.id} value={n.name}>{n.name}</option>
                            ))}
                    </select>
                    <input
                        type="text"
                        className="input"
                        value={equipment.amount}
                        onChange={e => setEquipmentAmount(e.target.value)}
                        placeholder="Количество"
                    />
                    <button className="btn" onClick={addEquipment}>Добавить</button>
                    <button className="btn" onClick={() => {
                        setMessage('');
                        setShowAddForm(false);
                    }}>Отмена</button>
                </div>
            )}

            {message && (
                <div className="message">
                    <p>{message} <button className="btn btn-danger" onClick={() => setMessage('')}>X</button></p>
                </div>
            )}

            {equipments.length === 0 ? (
                <p>Склад пустой</p>
            ) : (
                <table className="table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Название</th>
                        <th>Количество</th>
                        <th colSpan="2">Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {equipments.map((e, index) => (
                        <tr key={e.id}>
                            <td>{index + 1}</td>
                            <td>{e.name}</td>
                            <td>
                                {editingId === e.id ? (
                                    <input
                                        type="text"
                                        className="input"
                                        value={editingAmount}
                                        onChange={ev => setEditingAmount(ev.target.value)}
                                        placeholder="Количество"
                                    />
                                ) : (
                                    e.amount
                                )}
                            </td>
                            <td>
                                {editingId === e.id ? (
                                    <button className="btn" onClick={() => updateEquipment(e.id, editingAmount, e.name)}>Сохранить</button>
                                ) : (
                                    <button className="btn" onClick={() => {
                                        setShowAddForm(false);
                                        setEditingAmount(e.amount);
                                        setEditingId(e.id);
                                    }}>Изменить</button>
                                )}
                            </td>
                            <td>
                                {editingId === e.id ? (
                                    <button className="btn" onClick={() => setEditingId(null)}>Отмена</button>
                                ) : (
                                    <button className="btn btn-danger" onClick={() => deleteEquipment(e.id, e.name)}>Удалить</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );

}

export default StorageManager;