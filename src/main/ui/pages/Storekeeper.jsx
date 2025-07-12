import React, { useEffect, useState} from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NomenclatureManager, {getNomenclatures} from "../component/NomenclatureManager";
import StorageManager from "../component/StorageManager";
import RequestManager from "../component/RequestManager";

const Storekeeper = ({setMessage, user}) => {


    return (
        <>
            <StorageManager user={user} setMessage={setMessage}></StorageManager>
            <NomenclatureManager user={user} setMessage={setMessage}></NomenclatureManager>
            <RequestManager user={user} setMessage={setMessage}></RequestManager>
        </>
    )
}

export default Storekeeper