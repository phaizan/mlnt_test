import React, { useEffect, useState} from 'react';
import axios from 'axios';
import { getNomenclatures } from "./NomenclatureManager";
axios.defaults.withCredentials = true;


const RequestManager = ({ user, message, setMessage, messageId, setMessageId, nomenclatureChanded, setNomenclatureChanged, storageChanged, setStorageChanged, requestCreated, setRequestCreated }) => {
    const [requests, setRequests] = useState([]);
    const [items, setItems] = useState([]);
    const [nomenclatures, setNomenclatures] = useState([]);

    const getRequests = async () => {
        try {
            console.log("Получаю список заявок...");
            const response = await axios.get('http://localhost:8080/api/request');
            setRequests(response.data);
        } catch (e) {
            console.error('Ошибка при загрузке заявок: ', e)
        }
    }

    const addItem = () => {
        setItems(prev => [...prev, { id:'', name: '', amount: ''}]);
    };
    
    const addRequest = async () => {

        if (!checkDuplicates(items)) {
            if (isFormValid)
                try {
                    console.log(items);
                    const response = await axios.post(`http://localhost:8080/api/request`, items);
                    setMessage(`Запрос добавлен`);
                    setMessageId(3);
                    setRequestCreated(true);
                    setItems([]);
                    console.log("Данные", response.data);
                } catch (e) {
                    setMessage(e?.response?.data || `Ошибка при добавлении`);
                }
            else {
                setMessage("Поля не заполнены или введено неправильное количество")
            }
        }
        else {
            setMessage("В запросе есть дубликаты");
        }
        setMessageId(3);

    }

    const handleChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    }

    const checkDuplicates = (items) => {
        const seen = new Set();
        for (const item of items) {
            if (seen.has(item.nomenclatureId)) {
                return true; // Найден дубликат
            }
            seen.add(item.nomenclatureId);
        }
        return false; // Дубликатов нет
    };

    const deleteNotTest = async () => {
        try {
            await axios.delete('http://localhost:8080/api/request/test');
        }
        catch (e) {
            setMessage(e?.response?.data || 'Ошибка при удалении');
            setMessageId(3);
        }
    }

    const isFormValid = items.every(item => item.name && item.amount > 0);

    /*useEffect(() => {
        const fetchNomenclatures = async () => {
            const data = await getNomenclatures();
            setNomenclatures(data);
        };
        getRequests();
        fetchNomenclatures();
        setStorageChanged(false);
    }, [storageChanged]);*/

    useEffect(() => {
        const fetchNomenclatures = async () => {
            const data = await getNomenclatures();
            setNomenclatures(data);
        };
        fetchNomenclatures();
        setNomenclatureChanged(false)
    }, [nomenclatureChanded]);

    useEffect(() => {
        getRequests();
        setStorageChanged(false);
    }, [storageChanged]);

    useEffect(() => {
        getRequests();
        setRequestCreated(false);
    }, [requestCreated]);

    return (
        <div className="body">
            <h2>Управление заявками</h2>

            {items.length === 0 ? (
                <button className="btn" disabled={!(user && user.id)} onClick={() => {
                        addItem();
                }}>
                    Создать заявку
                </button>
            ) : null}
            <button className={"btn btn-danger"} onClick={(deleteNotTest)}>Удалить не тестовые</button>

            {items.length > 0 && (
                <div className="request-form">
                    {items.map((item, index) => (
                        <div key={index} className="form-row">
                            <select
                                value={item.name}
                                required
                                onChange={e => {
                                    const selectedName = e.target.value;
                                    const selected = nomenclatures.find(n => n.name === selectedName);
                                    if (selected) {
                                        handleChange(index, 'name', selectedName);
                                        handleChange(index, 'nomenclatureId', selected.id);
                                    }
                                }}
                            >
                                <option value="">Выберите ТМЦ</option>
                                {nomenclatures.map(n => (
                                    <option key={n.id} value={n.name}>{n.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Количество"
                                value={item.amount}
                                required
                                onChange={e => handleChange(index, 'amount', e.target.value)}
                            />
                            <button className="btn btn-danger" onClick={() =>
                                setItems(prev => prev.filter((_, i) => i !== index))
                            }>
                                Удалить
                            </button>
                        </div>
                    ))}
                    <div className="form-actions">
                        <button className="btn" onClick={addItem}>Добавить ТМЦ в заявку</button>
                        <button className="btn btn-primary" onClick={addRequest}>Отправить заявку</button>
                        <button className="btn" onClick={() => setItems([])}>Отмена</button>
                    </div>
                </div>
            )}

            {message && messageId === 3 &&(
                <div className="message">
                    <p>{message} <button className="btn btn-danger" onClick={() => {
                        setMessage('')
                        setMessageId(null);
                    }}>X</button></p>
                </div>
            )}

            {user ? (
                    <>
                    {requests.length === 0 ? (
                        <p>Список заявок пуст</p>
                    ) : (
                        <table className="table">
                            <thead>
                            <tr>
                                <th rowSpan="2">№ заявки</th>
                                <th rowSpan="2">Статус</th>
                                <th rowSpan="2">Создана</th>
                                <th rowSpan="2">Закрыта</th>
                                <th colSpan="6">Оборудование</th>
                            </tr>
                            <tr>
                                <th>Номер</th>
                                <th>Создана</th>
                                <th>Закрыта</th>
                                <th>Название</th>
                                <th>Количество</th>
                                <th>Статус</th>
                            </tr>
                            </thead>
                            <tbody>
                            {requests.map((req, i) => (

                                req.requestEquipments?.map((eq, idx) => (
                                    <tr key={eq.id}>
                                        {idx === 0 && (
                                            <>
                                                <td rowSpan={req.requestEquipments.length}>{i + 1}</td>
                                                <td rowSpan={req.requestEquipments.length}>{req.statusName}</td>
                                                <td rowSpan={req.requestEquipments.length}>
                                                    {req.createdAt ? new Date(req.createdAt).toLocaleString() : '—'}
                                                </td>
                                                <td rowSpan={req.requestEquipments.length}>
                                                    {req.closedAt ? new Date(req.closedAt).toLocaleString() : '—'}
                                                </td>
                                            </>
                                        )}
                                        <td>{idx + 1}</td>
                                        <td>{eq.name}</td>
                                        <td>{eq.amount}</td>
                                        <td>{eq.createdAt ? new Date(eq.createdAt).toLocaleString() : '—'}</td>
                                        <td>{eq.closedAt ? new Date(eq.closedAt).toLocaleString() : '—'}</td>
                                        <td>{eq.statusName}</td>
                                    </tr>
                                ))
                            ))}
                            </tbody>
                        </table>
                    )}
                    </>)
                : <p>Вы не авторизованы</p>
            }
        </div>
    );
}

export default RequestManager;