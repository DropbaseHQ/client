import { axios } from '@/lib/axios';
import { useState, useEffect } from 'react';
import { Button, Stack, Box } from '@chakra-ui/react';
import { PageLayout } from '@/layout';
import { useAtomValue } from 'jotai';
import { workspaceAtom } from '@/features/workspaces';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';

export const DeveloperSettings = () => {
	const workspaceId = useAtomValue(workspaceAtom);
    const { user } = useGetCurrentUser();
    const [userProxyTokens, setUserProxyTokens] = useState<string[]>([]);

    const handleButtonClick = async () => {
        const response = await axios.post(`/token/`, {
            token: "",
            user_id: user.id,
            workspace_id: workspaceId,
        });
        setUserProxyTokens([...userProxyTokens, response.data.token]);
    };

    useEffect(() => {
        async function getProxyTokens() {
            const response = await axios.get(`/token/${workspaceId}/${user.id}`);
            setUserProxyTokens(response.data);
        }
        getProxyTokens();
    }, []);

    return (
        <PageLayout title="Developer Settings">
            <Button onClick={handleButtonClick}>Generate Proxy Token</Button>
            <Stack mt="4" spacing={2}>
                {userProxyTokens.map((token, index) => (
                    <Box key={index} bg="gray.100" p="3">
                        {token}
                    </Box>
                ))}
            </Stack>
        </PageLayout>
    );
};