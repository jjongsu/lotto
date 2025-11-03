import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './Home';
import GetLotto from './GetLotto';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../queries/queryClient';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/get-lotto',
        element: <GetLotto />,
    },
]);

export default function Router() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}
