import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import inShipmentsSlice from './slices/inShipmentsSlice';
import destinationsSlice from './slices/destinationsSlice';
import outShipmentsSlice from './slices/outShipmentsSlice';
import companiesSlice from './slices/companiesSlice';

export const store = configureStore({
    reducer: {
        user: userSlice,
        inShipments: inShipmentsSlice, // Inbound shipments
        outShipments: outShipmentsSlice, // Outbound (pending export) shipments
        destinations: destinationsSlice,
        companies: companiesSlice,
    },
})  