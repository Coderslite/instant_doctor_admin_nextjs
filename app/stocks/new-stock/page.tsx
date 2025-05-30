import React, { Suspense } from 'react';
import NewStock from './NewStock';

const NewStockPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewStock />
        </Suspense>
    );
};

export default NewStockPage;
