import React, {useEffect, useState} from 'react';
import axios from 'axios';


const StorageManager = () => {
    const [equipments, setEquipments] = useState([]);
    const [equipmentName, setEquipmentName] = useState('');
    const [equipmentAmount, setEquipmentAmount] = useState('');

    const [message, setMessage] = useState('');

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
            const response = await axios.post('http://localhost:8080/api/equipment', {name: equipmentName, amount: equipmentAmount})
            setMessage(response.data);
            setEquipmentName('');
            setEquipmentAmount('');
            getEquipments();
        }
        catch (error)
        {
            setMessage(error?.response?.data || 'Ошибка при добавлении');
        }
    }

    useEffect(() => {
        getEquipments();
    }, []);

    return (
        <div>
            <h1>Корректировка остатков на складе</h1>

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
            </div>

            {message && <p>{message}</p>}

            <table>
                {equipments.map(e => (
                    <tr key={e.id}>
                        <td>{e.id + 1}</td>
                        <td>{e.name}</td>
                        <td>{e.amount}</td>
                    </tr>
                ))}
            </table>
        </div>
    );

}

export default StorageManager;