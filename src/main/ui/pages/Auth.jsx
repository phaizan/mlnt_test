import React, { useEffect, useState} from 'react';
import '../styles/Login.css'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { resetMessage, showMessage} from "../ReactEntry";

const Auth = ({ user, message, setMessage, messageId, setMessageId, setUser, setHello}) => {
    const [newUser, setNewUser] = useState({});
    const [showRegistrationFrom, setShowRegistrationFrom] = useState(false);
    const [showLoginFrom, setShowLoginFrom] = useState(true);
    const [loginRequest, setLoginRequest] = useState({});
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

    const login = async () => {
        if (!loginRequest.login.trim()) {
            setMessage('Введите логин');
            setMessageId(2);
            return;
        }
        console.log(loginRequest);
        try {
            const response = await axios.post(
                'http://localhost:8080/api/user/login',
                loginRequest
            );
            const loggedUser = response.data;
            setUser(loggedUser);
            setLoginRequest({});
            setShowLoginFrom(true);
            if (loggedUser.roleId === 1)
                navigate('/employee')
            if (loggedUser.roleId === 2 || loggedUser.roleId === 3)
                navigate('/storekeeper')
        }
        catch (e) {
            console.error(e);
            setMessage(e?.response?.data || "Ошибка при авторизации");
            setMessageId(1);
        }
    }

    const registr = async () => {
        try {
            setLoginRequest({});
            console.log(newUser);
            const response = await axios.post('http://localhost:8080/api/user/registration', newUser);
            setMessage(`Пользователь ${response.data.name} зарегистрирован`);
            setMessageId(3);
            setShowRegistrationFrom(false);
            setShowLoginFrom(true);
        }
        catch (e) {
            setMessage(e?.response?.data || "Ошибка при регистрации");
            setMessageId(1);
        }
    }

    const handleLoginChange = (field, value) => {
        setLoginRequest(prev => ({...prev, [field]: value}))
    }

    const handleUserChange = (field, value) => {
        setNewUser(prev => ({...prev, [field]: value}))
    }

    useEffect(() => {
        if (user?.name) {
            if (user.roleId === 1)
                navigate('/employee')
            if (user.roleId === 2 || user.roleId === 3)
                navigate('/storekeeper')
            setHello(`${user.name}`);
        }

        const fetchRoles = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/user/roles');
                setRoles(response.data);
                console.log(response.data)
            }
            catch (e) {
                console.error('Ошибка при загрузке ролей', e);
                return [];
            }
        }
        fetchRoles();
    }, [user])

    return (
        <div className="login">
            <div className="form-wrapper">
                <div className="form-box">
                    { !user && !user?.name &&
                        (<>
                            {showLoginFrom &&
                                <>
                                    <h2>Авторизация</h2>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        login();
                                    }}>
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

                                        <button className="btn" type="submit">Войти</button>
                                        <p>
                                            Нет аккаунта? <a onClick={() => {
                                            resetMessage(setMessage, setMessageId);
                                            setShowRegistrationFrom(true);
                                            setShowLoginFrom(false)
                                        }}>Зарегистрироваться</a>
                                        </p>
                                    </form>
                                </>
                            }
                            {showRegistrationFrom &&
                                <>
                                    <h2>Регистрация</h2>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        registr();
                                    }}>
                                        <input
                                            type="text"
                                            required
                                            value={newUser?.name}
                                            onChange={e => handleUserChange("name", e.target.value)}
                                            placeholder="Имя"
                                        />
                                        <input
                                            type="text"
                                            required
                                            value={newUser?.login}
                                            onChange={e => handleUserChange("login", e.target.value)}
                                            placeholder="Логин"
                                        />
                                        <input
                                            type="text"
                                            required
                                            value={newUser?.password}
                                            onChange={e => handleUserChange("password", e.target.value)}
                                            placeholder="Пароль"
                                        />
                                        <select
                                            value={newUser?.roleId}
                                            required
                                            onChange={e => {
                                                handleUserChange("roleId", e.target.value)
                                            }}
                                        >
                                            <option value="">Выберите роль</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>

                                        <button className="btn" type="submit">Зарегистрироваться</button>

                                        <p>
                                            Уже есть аккаунт? <a onClick={() => {
                                            resetMessage(setMessage, setMessageId);
                                            setShowRegistrationFrom(false);
                                            setShowLoginFrom(true)
                                        }}>Войти</a>
                                        </p>
                                    </form>
                                </>}

                            {message && Math.floor(messageId / 10) === 0 &&(
                                showMessage(message, messageId, setMessage, setMessageId)
                            )}

                        </>)
                    }
                </div>
            </div>
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


export default Auth;