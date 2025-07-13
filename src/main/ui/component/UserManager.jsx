import React, { useState } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;

const UserManager = ({ setMessage, user, setUser}) => {
    const [showRegistrationFrom, setShowRegistrationFrom] = useState(false);
    const [showLoginFrom, setShowLoginFrom] = useState(false);
    const [loginRequest, setLoginRequest] = useState({});
    const [roles, setRoles] = useState([]);
    const login = async () => {
        try {
            const response = await axios.post(
                'http://localhost:8080/api/user/login',
                loginRequest
            );
            setUser(response.data);
            setLoginRequest({});
            setShowLoginFrom(false);
            setMessage(`Пользователь ${response.data.name} авторизован`);
        }
        catch (e) {
            setMessage(e?.response?.data || "Ошибка при авторизации");
        }
    }
    const registr = async () => {
        try {
            console.log(user);
            const response = await axios.post('http://localhost:8080/api/user/registration', user);
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

    const handleUserChange = (field, value) => {
        setUser(prev => ({...prev, [field]: value}))
    }

    return (
        <div className="body">
            <button className="btn" onClick={() => {
                if (!user) {
                    setShowLoginFrom(true);
                    setShowRegistrationFrom(false);
                }
                else {
                    setMessage("Вы уже авторизованы");
                }
            }}>Авторизоваться</button>

            <button className="btn" onClick={() => {
                if (!user) {
                    setShowRegistrationFrom(true);
                    setShowLoginFrom(false);
                }
                else {
                    setMessage("Вы не можете зарегистрироваться, потому что вы авторизованы");
                }
            }}>Зарегистрироваться</button>


            {showRegistrationFrom &&
                <div>
                    <h2>Регистрация</h2>
                    <div className="form-row">
                        <input
                            type="text"
                            required
                            value={user?.name}
                            onChange={e => handleUserChange("name", e.target.value)}
                            placeholder="Имя"
                        />
                        <input
                            type="text"
                            required
                            value={user?.login}
                            onChange={e => handleUserChange("login", e.target.value)}
                            placeholder="Логин"
                        />
                        <input
                            type="text"
                            required
                            value={user?.password}
                            onChange={e => handleUserChange("password", e.target.value)}
                            placeholder="Пароль"
                        />
                        <select
                            value={user?.roleId}
                            onChange={e => {
                            handleUserChange("roleId", e.target.value)
                        }}
                        >
                            <option value="">Выберите роль пользователя</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <button className="btn" onClick={registr}>Зарегистрироваться</button>
                    </div>
                </div>
            }


            {showLoginFrom &&
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
                        <button className="btn" onClick={login}>Авторизоваться</button>
                    </div>
                </div>
            }

        </div>
    )
}

export const getUserData = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/user/data');
        return response.data;
    }
    catch (e) {
        console.error("Пользователь не авторизован");
        return null;
    }
}

export default UserManager;