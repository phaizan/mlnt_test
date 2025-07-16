import React from 'react';
import StorageManager from "../component/StorageManager";
import RequestManager from "../component/RequestManager";

const Employee = ({ user, message, setMessage, messageId, setMessageId, nomenclatureChanged, setNomenclatureChanged, storageChanged, setStorageChanged, requestCreated, setRequestCreated }) => {
    return (
        <>
            <StorageManager user={user}
                            message={message} setMessage={setMessage} messageId={messageId} setMessageId={setMessageId}
                            nomenclatureChanged={nomenclatureChanged} setNomenclatureChanged={setNomenclatureChanged}
                            setStorageChanged={setStorageChanged}
                            requestCreated={requestCreated} setRequestCreated={setRequestCreated}></StorageManager>
            <RequestManager user={user}
                            message={message} setMessage={setMessage} messageId={messageId} setMessageId={setMessageId}
                            nomenclatureChanged={nomenclatureChanged} setNomenclatureChanged={setNomenclatureChanged}
                            storageChanged={storageChanged} setStorageChanged={setStorageChanged}
                            requestCreated={requestCreated} setRequestCreated={setRequestCreated}></RequestManager>
        </>
    )
}

export default Employee