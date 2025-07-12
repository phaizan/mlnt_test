import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManager = () => {
    const [user, setUser] = useState();
    const [showRegistrationFrom, setShowRegistrationFrom] = useState(false);
    const [showAuthFrom, setShowAuthFrom] = useState(false);
    const [registrRequest, setRegistrRequest] = useState({});
    const [loginRequest, setLoginRequest] = useState({});
    const [roles, setRoles] = useState([]);
    const [message, setMessage] = useState('');
    const auth = async () => {
        console.log(loginRequest)
        try {
            const response = await axios.post('http://localhost:8080/api/user/login', loginRequest);
            setUser(response.data);
            setMessage(`Пользователь ${response.data.name} авторизован`);
        }
        catch (e) {
            setMessage(e?.response?.data || "Ошибка при авторизации");
        }
    }
    const registr = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/user/registration', registrRequest);
            setUser(response.data);
            setMessage(`Пользователь ${response.data.name} зарегистрирован`);
        }
        catch (e) {
            setMessage(e?.response?.data || "Ошибка при регистрации");
        }
    }

    const handleLoginChange = (field, value) => {
        setLoginRequest(prev => ({...prev, [field]: value}))
    }
    const handleRegistrChange = (field, value) => {
        setRegistrRequest(prev => ({...prev, [field]: value}))
    }

    return (
        <div className="body">
            <button className="btn" onClick={() => {
                setShowAuthFrom(true);
                setShowRegistrationFrom(false);
            }}>Авторизоваться</button>

            <button className="btn" onClick={() => {
                setShowRegistrationFrom(true);
                setShowAuthFrom(false);
            }}>Зарегистрироваться</button>

            {showRegistrationFrom &&
                <div>
                    <h2>Регистрация</h2>
                    <div className="form-row">
                        <input
                            type="text"
                            required
                            value={user.name}
                            onChange={e => handleRegistrChange("name", e.target.value)}
                            placeholder="Логин"
                        />
                        <input
                            type="text"
                            required
                            value={user.login}
                            onChange={e => handleRegistrChange("login", e.target.value)}
                            placeholder="Логин"
                        />
                        <input
                            type="text"
                            required
                            value={user.password}
                            onChange={e => handleRegistrChange("password", e.target.value)}
                            placeholder="Пароль"
                        />
                        <select>
                            value={user.role}
                            onChange={e => handleRegistrChange("role", e.target.value)}
                            <option value="">Выберите роль пользователя</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                        </select>
                        <button className="btn" onClick={registr}>Зарегистрироваться</button>
                    </div>
                </div>
            }


            {showAuthFrom &&
                <div>
                    <h2>Авторизация</h2>
                    <div className="form-row">
                        <input
                            type="text"
                            required
                            value={loginRequest.login}
                            onChange={e => handleLoginChange("login", e.target.value)}
                            placeholder="Логин"
                        />
                        <input
                            type="text"
                            required
                            value={loginRequest.password}
                            onChange={e => handleLoginChange("password", e.target.value)}
                            placeholder="Пароль"
                        />
                        <button className="btn" onClick={auth}>Авторизоваться</button>
                    </div>
                </div>
            }
            {message && <p>{message}</p>}

        </div>
    )




}
export default UserManager;