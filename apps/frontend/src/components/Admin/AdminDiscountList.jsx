import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Grid,
    Chip,
} from '@mui/material';
import { adminDiscountCodes, approveDiscountCode } from '../../services/api/admin';
import { useEffect, useState } from 'react';
import useSnackbarStore from '../../store/notificationStore';

const AdminDiscountList = () => {
    const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

    const [discountCodes, setDiscountCodes] = useState([]);
    const getDiscountCodes = async () => {
        try {
            const response = await adminDiscountCodes();
            setDiscountCodes(response.data.data); // Assuming the structure has 'data.data' for products
        } catch (err) {
            console.error(err, 'Failed to fetch products');
        }
    };
    useEffect(() => {
        getDiscountCodes();
    }, [showSnackbar,setDiscountCodes]);

    // Handlers for actions
    const handleApproveApplication = async (approveData) => {
        try {
            const { data } = await approveDiscountCode(approveData);
            if (data.success) {
                showSnackbar("Successfully approved status code")
            } else {
                showSnackbar(data.message)

            }
        } catch (error) {
            console.error(error)
            showSnackbar("Failed to approve status code")
        }
    };
    return (
        <>
            <Grid container spacing={4}>
                {/* Section for Discount Applications */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography variant="h5" sx={{ marginBottom: 2 }}>
                            Discount Code Applications
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>User-Name</TableCell>
                                        <TableCell>Current Placed Orders Count Of User</TableCell>
                                        <TableCell>Is Redeemed</TableCell>
                                        <TableCell>Is Approved</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {discountCodes.map((application) => (
                                        <TableRow key={application.name}>
                                            <TableCell>{application.name}</TableCell>
                                            <TableCell>{application.user.name}</TableCell>
                                            <TableCell>{application.user.discountApplicationCount}</TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={application.isRedeemed ? "Yes" : "No"}
                                                    color={application.isRedeemed ? "success" : "warning"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={application.isApprovedByAdmin ? "Yes" : "No"}
                                                    color={application.isApprovedByAdmin ? "success" : "error"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {!application.isApprovedByAdmin && application.isApproval && (
                                                    <>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleApproveApplication({ id: application.id, userId: application.user.id })}
                                                            sx={{ marginRight: 1 }}
                                                        >
                                                            Approve
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default AdminDiscountList;
