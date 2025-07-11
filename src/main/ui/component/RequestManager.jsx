import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { getNomenclatures } from "./NomenclatureManager";


const RequestManager = () => {
    const [requests, setRequests] = useState([

    ]);
    const [items, setItems] = useState([]);
    const [nomenclatures, setNomenclatures] = useState([]);
    const [message, setMessage] = useState('');

    const getRequests = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/request');
            setRequests(response.data);
        }
        catch (e) {
            console.error('Ошибка при загрузке заявок: ')
        }
    }

    const addItem = () => {
        setItems(prev => [...prev, { id:'', name: '', amount: ''}]);
    };
    
    const addRequest = async () => {
        if (!checkDuplicates(items)) {
            try {
                console.log(items);
                const response = await axios.post('http://localhost:8080/api/request', items);
                setRequests(prev => [...prev, response.data]);
                setMessage(`Запрос добавлен`);
                setItems([]);
                console.log("Данные", response.data);
            } catch (e) {
                setMessage(e?.response?.data || `Ошибка при добавлении`);
            }
        }
        else {
            setMessage("В запросе есть дубликаты");
        }
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
            getRequests();
        }
        catch (e) {
            setMessage(e?.response?.data || 'Ошибка при удалении');
        }
    }

    const isFormValid = items.every(item => item.name && item.amount);

    useEffect(() => {
        getRequests();
        const fetchNomenclatures = async () => {
            const data = await getNomenclatures();
            setNomenclatures(data);
        };
        fetchNomenclatures();
    }, []);

    return (
        <div className="body">
            <h2>Управление заявками</h2>

            {items.length === 0 ? (
                <button className="btn" onClick={() => {
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
                        <button className="btn btn-primary" onClick={addRequest} disabled={!isFormValid}>Отправить заявку</button>
                        <button className="btn" onClick={() => setItems([])}>Отмена</button>
                    </div>
                </div>
            )}

            {message && (
                <div className="message">
                    <p>{message} <button className="btn btn-danger" onClick={() => setMessage('')}>X</button></p>
                </div>
            )}

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
                                        <td rowSpan={req.requestEquipments.length}>{req.id}</td>
                                        <td rowSpan={req.requestEquipments.length}>{req.statusName}</td>
                                        <td rowSpan={req.requestEquipments.length}>
                                            {req.createdAt ? new Date(req.createdAt).toLocaleString() : '—'}
                                        </td>
                                        <td rowSpan={req.requestEquipments.length}>
                                            {req.closedAt ? new Date(req.closedAt).toLocaleString() : '—'}
                                        </td>
                                    </>
                                )}
                                <td>{eq.id}</td>
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
        </div>
    );
}

export default RequestManager;