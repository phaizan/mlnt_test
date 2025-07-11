import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManager = () => {
    const [user, setUser] = useState({
    });
    const [message, setMessage] = useState('');
    const auth = async () => {
        console.log(user)
        try {
            const response = await axios.post('http://localhost:8080/api/user', user);
            setUser(response.data);
            setMessage(`Пользователь ${response.data.name} авторизован`);
        }
        catch (e) {
            setMessage(e?.response?.data || "Ошибка при авторизации")
        }
    }

    const handleChange = (field, value) => {
        setUser(prev => ({...prev, [field]: value}))

    }






    return (
        <div className="body">
            <h2>Авторизация</h2>
            <div className="form-row">
                <input
                    type="text"
                    value={user.login}
                    onChange={e => handleChange("login", e.target.value)}
                    placeholder="Логин"
                />
                <input
                    type="text"
                    value={user.password}
                    onChange={e => handleChange("password", e.target.value)}
                    placeholder="Пароль"
                />
                <button className="btn" onClick={auth}>Авторизоваться</button>
            </div>

            {message && <p>{message}</p>}

        </div>
    )




}
export default UserManager;