import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {getNomenclatures} from "./NomenclatureManager";
import {getButtonIcon, resetMessage, showMessage} from "../ReactEntry";
import {faEraser, faFloppyDisk, faPencil, faTrash} from "@fortawesome/free-solid-svg-icons";
axios.defaults.withCredentials = true;

const StorageManager = ({ user, message, setMessage, messageId, setMessageId, nomenclatureChanged, setNomenclatureChanged, setStorageChanged, requestCreated, setRequestCreated }) => {
    const [equipments, setEquipments] = useState([]);
    const [equipment, setEquipment] = useState({
        name: '',
        amount: ''
    })
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingAmount, setEditingAmount] = useState(null);
    const [nomenclatures, setNomenclatures] = useState([]);
    const [isEmployee, setIsEmployee] = useState(null);

    const getEquipments = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/equipment');
            setEquipments(response.data);
        } catch (e) {
            console.error('Ошибка при загрузке остатков: ', e);
        }
    };

    const addEquipment = async () => {
        if (!equipment.name.trim() || !equipment.amount.trim()) {
            setMessage("Заполните все поля");
            setMessageId(22);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/equipment', {
                name: equipment.name,
                amount: equipment.amount
            });
            const newEquipment = response.data;

            if (newEquipment.amount !== 0){
                setEquipments(prev => {
                    const updated = [...prev, newEquipment];
                    updated.sort((a, b) => a.name.localeCompare(b.name));
                    return updated;
                });
                if (newEquipment.amount === Number(equipment.amount)) {
                    setMessage(`Добавлено "${newEquipment.name}"`);
                    setMessageId(23);
                }
                else {
                    setMessage(`Часть оборудования "${equipment.name}" было отданы заявке(-ам) в очереди при добавлении`);
                    setMessageId(23);
                }
            }
            else {
                setMessage(`Всё оборудование "${equipment.name}" было отдано заявке(-ам) в очереди при добавлении`);
                setMessageId(23);
            }
            setStorageChanged(true);
            resetForm();
        }
        catch (e) {

            setMessage(e?.response?.data || 'Ошибка при добавлении');
            setMessageId(21);
            if (e.response.status === 409) //если существует в списке
                resetForm();
        }
    };

    const updateEquipment = async (id, newAmount, name) => {
        try {
            if (newAmount <= '0') {
                setMessage(`Неправильное количество у "${name}"`)
                setMessageId(22);
                return;
            }
            const response = await axios.put(`http://localhost:8080/api/equipment/${id}`, {
                name: name,
                amount: newAmount
            });
            const updatedEquipment = response.data;
            if (updatedEquipment.amount !== 0) {
                setEquipments(prev => prev.map(eq => eq.name === name ? updatedEquipment : eq));
                if (Number(newAmount) === updatedEquipment.amount) {
                    setMessage(`"${name}" успешно обновлено`);
                    setMessageId(23);
                }
                else {
                    setMessage(`Часть оборудования "${updatedEquipment.name}" было отдано заявке(-ам) в очереди при обновлении`);
                    setMessageId(23);
                }
            }
            else {
                setEquipments(prev => prev.filter(eq => eq.name !== name));
                setMessage(`Всё оборудование "${updatedEquipment.name}" было отдано заявке(-ам) в очереди при обновлении`);
                setMessageId(23);
            }
            setEditingId(null);
            setEditingAmount(null);
            setStorageChanged(true);
        } catch (e) {
            if (e.response.status === 410) {
                setEquipments(prev => prev.filter(eq => eq.id !== id));
                setMessage(`${name} удалено`)
                setMessageId(23);
            }
            else {
                setMessage(e?.response?.data || 'Ошибка при изменении');
                setMessageId(21);
            }
        }
    };

    const deleteEquipment = async (id, name) => {
        if (!window.confirm(`Вы уверены, что хотите удалить "${name}"?`)) {
            return;
        }
        try {
            await axios.delete(`http://localhost:8080/api/equipment/${id}`);
            setEquipments(prev => prev.filter(eq => eq.id !== id));
            setMessage(`Оборудование "${name}" удалено`);
            setMessageId(23);
        }
        catch (e) {
            setMessage(e?.response?.data || 'Ошибка при удалении');
            setMessageId(21);
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
        console.log(user);
        if (user?.roleId === 1)
            setIsEmployee(true);
        if (user?.roleId === 2 || user?.roleId === 3)
            setIsEmployee(false);
    }, [user]);

    useEffect(() => {
        getEquipments();
        const fetchNomenclatures = async () => {
            const data = await getNomenclatures();
            setNomenclatures(data);
        };
        fetchNomenclatures();
        setNomenclatureChanged(false);
    }, [nomenclatureChanged])

    useEffect(() => {
        getEquipments();
        setRequestCreated(false)
    }, [requestCreated])

    return (
        <div className="body">
            <h2>Список остатков на складе</h2>


            {!isEmployee && !showAddForm && (
                <button className="btn" onClick={() => {
                    setShowAddForm(true);
                    setEditingId(null);
                    setEditingAmount(null);
                }}>
                    Зарегистрировать новую ТМЦ
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
                        inputMode="numeric"
                        value={equipment.amount}
                        onChange={e => {
                            const val = e.target.value;
                            if (val === '' || /^[1-9][0-9]*$/.test(val)) {
                                setEquipmentAmount(val);
                            }
                        }}
                        placeholder="Количество"
                    />
                    {getButtonIcon(faEraser, "Отмена", () => {
                        resetMessage(setMessage, setMessageId);
                        setShowAddForm(false);
                    })}
                    {getButtonIcon(faFloppyDisk,"Сохранить", addEquipment)}
                </div>
            )}

            {message && Math.floor(messageId / 10) === 2 &&(
                showMessage(message, messageId, setMessage, setMessageId)
            )}

            {equipments.length === 0 ? (
                <p>Склад пустой</p>
            ) : (
                <table className="table">
                    <thead>
                    <tr>
                        <th>№</th>
                        <th className="name">Название</th>
                        <th className="amount">Количество</th>
                        {!isEmployee && <th colSpan="2">Действия</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {equipments.map((e, index) => (
                        <tr key={e.id}>
                            <td className="numbers">{index + 1}</td>
                            <td className="name">{e.name}</td>
                            <td className="amount">
                                {editingId === e.id ? (
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="input"
                                        value={editingAmount}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === '' || /^[1-9][0-9]*$/.test(val)) {
                                                setEditingAmount(val);
                                            }
                                        }}
                                        placeholder="Количество"
                                    />
                                ) : (
                                    e.amount
                                )}
                            </td>
                            {!isEmployee &&
                                <>
                                    <td>
                                        {editingId === e.id ? ( getButtonIcon(faEraser,"Отмена", () => setEditingId(null))
                                        ) : getButtonIcon(faPencil, "Изменить", () => {
                                                setShowAddForm(false);
                                                setMessage('');
                                                setMessageId(null);
                                                setEditingAmount(e.amount);
                                                setEditingId(e.id);
                                            })
                                        }
                                    </td>
                                    <td>
                                        {editingId === e.id ? (
                                            getButtonIcon(faFloppyDisk, "Сохранить", () => {
                                            if (e.amount !== editingAmount)
                                            updateEquipment(e.id, editingAmount, e.name)
                                            else
                                            setEditingId(null);
                                        })) : (getButtonIcon(faTrash, "Удалить", () => deleteEquipment(e.id, e.name)))}
                                    </td>
                                </>}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );

}

export default StorageManager;