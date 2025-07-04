import React, {useEffect, useState} from 'react';
import axios from 'axios';


const StorageManager = () => {
    const [equipments, setEquipments] = useState([]);


    const getEquipments = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/equipment');
            setEquipments(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке остатков', error);
        }
    };

    useEffect(() => {
        getEquipments();
    }, []);

    return (
        <div>
            <h1>Корректировка остатков на складе</h1>

            <table>
                {equipments.map(e => (
                    <tr>
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