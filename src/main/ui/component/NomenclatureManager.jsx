import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {getButtonIcon, resetMessage, showMessage} from "../ReactEntry";

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
library.add(fas, far);



import {
    faEraser,
    faFloppyDisk,
    faPencil, faTrash
} from "@fortawesome/free-solid-svg-icons";

axios.defaults.withCredentials = true;

const NomenclatureManager = ({ message, setMessage, messageId, setMessageId, setNomenclatureChanged }) => {
    const [nomenclatures, setNomenclatures] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const addNomenclature = async () => {
        if (!newName.trim()) {
            setMessage("Введите название номенклатуры");
            setMessageId(13);
            return;
        }
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
            setMessageId(13);
            setShowAddForm(false);
            setNomenclatureChanged(true);
        }
        catch (e) {
            if (e.response.status === 409) {
                setMessage(e?.response?.data);
            }
            else {
                setMessage(e?.response?.data || 'Ошибка при изменении');
            }
            setMessageId(11);
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
            setMessageId(13);
            setEditingId(null);
            setNewName('');
            setNomenclatureChanged(true);
        }
        catch (e) {
            if (e.response.status === 409)
                setMessage(e?.response?.data);
            else
                setMessage(e?.response?.data || 'Ошибка при изменении');
            setMessageId(11);
        }
    }

    const deleteNomenclature = async (id, name) => {
        if (!window.confirm(`Вы уверены, что хотите удалить "${name}"?`)) {
            return;
        }
        try {
            await axios.delete(`http://localhost:8080/api/nomenclature/${id}`);
            setNomenclatures(prev => prev.filter(eq => eq.id !== id));
            setMessage(`Номенклатура "${name}" удалена`);
            setNomenclatureChanged(true);
            setMessageId(13);
        }
        catch (e) {
            setMessage(e?.response?.data || 'Ошибка при удалении');
            setMessageId(11);
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


            { showAddForm ? (
                    <div className="form-row">
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Название номенклатуры"
                        />

                        <span className="fa-stack fa-lg">
                            <i className="fa fa-square-o fa-stack-2x"></i>
                            <i className="fa fa-twitter fa-stack-1x"></i>
                        </span>

                        {
                            getButtonIcon(faEraser, "Отмена", () => setShowAddForm(false))
                        }

                        {
                            getButtonIcon(faFloppyDisk, "Сохранить", addNomenclature)
                        }
                    </div>) :
                (<button className="btn" onClick={() => {
                    setEditingId(null);
                    setShowAddForm(true)
                    resetMessage(setMessage, setMessageId);
                }}>Зарегистрировать новую номенклатуру</button>)
            }
            {message && Math.floor(messageId / 10) === 1 &&(
                showMessage(message, messageId, setMessage, setMessageId)
            )}
            {
                nomenclatures.length === 0 ? (
                    <p>Список номенклатур пустой</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>№</th>
                                <th className="name">Название</th>
                                <th colSpan="2">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                        { nomenclatures.map((n, index) => (
                            <tr key={n.id}>
                                <td className="numbers">{index + 1}</td>
                                <td className="name">
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
                                            ? getButtonIcon(faEraser, "Отмена", () => setEditingId(null))
                                            : getButtonIcon(faPencil, "Изменить", () => {
                                                setShowAddForm(false);
                                                setEditingId(n.id)
                                                setEditName(n.name)
                                            })
                                    }
                                </td>
                                <td>
                                    {
                                        editingId === n.id
                                            ? getButtonIcon(faFloppyDisk, "Сохранить", () => updateNomenclature(n.id, editName))
                                            : getButtonIcon(faTrash, "Удалить", () => deleteNomenclature(n.id, n.name))
                                    }
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )
            }
        </div>
    );
}
export default NomenclatureManager;

export const getNomenclatures = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/nomenclature');
        return response.data;
    } catch (error) {
        console.error('Ошибка при загрузке номенклатур', error);
        return [];
    }
};