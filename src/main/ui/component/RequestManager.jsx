import React, { useEffect, useState} from 'react';
import axios from 'axios';
import { getNomenclatures } from "./NomenclatureManager";
axios.defaults.withCredentials = true;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircle, faEraser,
    faPaperPlane,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import {getButtonIcon, resetMessage, showMessage} from "../ReactEntry";

const RequestManager = ({ user, message, setMessage, messageId, setMessageId, nomenclatureChanged, setNomenclatureChanged, storageChanged, setStorageChanged, requestCreated, setRequestCreated }) => {
    const [requests, setRequests] = useState([]);
    const [items, setItems] = useState([]);
    const [nomenclatures, setNomenclatures] = useState([]);

    const getRequests = async () => {
        try {
            console.log("Получаю список заявок...");
            const response = await axios.get('http://localhost:8080/api/request');

            if (requests === response.data) {
                setMessage("Заявка исполнена");
                setMessageId(33);
            }

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
                    setMessageId(33);
                    setMessage(`Запрос добавлен`);
                    setRequestCreated(true);
                    setItems([]);
                    console.log("Данные", response.data);
                } catch (e) {
                    setMessage(e?.response?.data || `Ошибка при добавлении`);
                    setMessageId(31);
                }
            else {
                setMessage("Поля не заполнены или введено неправильное количество")
                setMessageId(32);
            }
        }
        else {
            setMessage("В запросе есть дубликаты");
            setMessageId(32);
        }
        console.log(messageId, messageId / 10, messageId % 10);

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

    const isFormValid = items.every(item => item.name && item.amount > 0);

    const setDate = (date) => {
        return date ? new Date(date).toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'
    }

    const getStatusIcon = (status) => {
        let color;
        switch (status) {
            case 'В работе':
                color = 'orange'
                break;
            case 'Завершено':
                color = 'green';
                break;
            default:
                color = 'grey';
                break;
        }
        return <FontAwesomeIcon icon={faCircle} style={{ color: color, cursor: "default" }} title={status} />
    }

    useEffect(() => {
        const fetchNomenclatures = async () => {
            const data = await getNomenclatures();
            setNomenclatures(data);
        };
        fetchNomenclatures();
        setNomenclatureChanged(false)
    }, [nomenclatureChanged]);

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
                    Зарегистрировать заявку
                </button>
            ) : null}
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
                            {getButtonIcon(faTrash, "Удалить", () => {
                                if (!window.confirm(`Вы уверены, что хотите удалить эту строку из заявки?`)) {
                                    return;
                                }
                                setItems(prev => prev.filter((_, i) => i !== index));
                                resetMessage(setMessage, setMessageId);})}
                        </div>
                    ))}
                    <div className="form-row">
                        <button className="btn" onClick={addItem}>Добавить ТМЦ в заявку</button>
                        {getButtonIcon(faEraser, "Отмена", () => setItems([]))}
                        {getButtonIcon(faPaperPlane, "Отправить заявку", addRequest)}
                    </div>
                </div>
            )}

            {message && Math.floor(messageId / 10) === 3 && (
                showMessage(message, messageId, setMessage, setMessageId)
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
                            <th colSpan="5">Оборудование</th>
                            <th rowSpan="2">Создана</th>
                            <th rowSpan="2">Закрыта</th>
                            <th rowSpan="2">Статус</th>
                        </tr>
                        <tr>
                            <th>Номер</th>
                            <th className="name">Название</th>
                            <th>Количество</th>
                            {/*<th>Создана</th>*/}
                            <th>Закрыта</th>
                            <th>Статус</th>
                        </tr>
                        </thead>
                        <tbody>
                        {requests.map((req, i) => (
                            req.requestEquipments?.map((eq, idx) => (
                                <tr className="request-row" key={eq.id} style={{ backgroundColor: i % 2 === 1 ? '#f3f3f3' : '#ffffff'}}>
                                    {idx === 0 && (
                                        <>
                                            <td className="numbers" rowSpan={req.requestEquipments.length}>{i + 1}</td>
                                        </>
                                    )}
                                    <td className="numbers">{idx + 1}</td>
                                    <td className="name">{eq.name}</td>
                                    <td className="amount">{eq.amount}</td>
                                    {/*<td>{eq.createdAt ? new Date(eq.createdAt).toLocaleString() : '—'}</td>*/}
                                    <td>{setDate(eq.closedAt)}</td>
                                    <td>{getStatusIcon(eq.statusName)}</td>
                                    {idx === 0 && (
                                        <>
                                            <td rowSpan={req.requestEquipments.length}>
                                                {setDate(req.createdAt)}</td>
                                            <td rowSpan={req.requestEquipments.length}>
                                                {setDate(req.closedAt)}</td>
                                            <td rowSpan={req.requestEquipments.length}>{getStatusIcon(req.statusName)}</td>
                                        </>
                                    )}
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