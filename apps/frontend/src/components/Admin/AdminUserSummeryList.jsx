import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    Chip,
} from '@mui/material';
import { adminUserDetails } from '../../services/api/admin';
import { useEffect, useState } from 'react';
import '../../styles/headerTableStyles.css'

const AdminUserList = () => {
    const [userData, setDiscountUserData] = useState([]);
    useEffect(() => {
        const getDiscountUserData = async () => {
            try {
                const response = await adminUserDetails();
                setDiscountUserData(response.data.data); // Assuming the structure has 'data.data' for products
            } catch (err) {
                console.error(err, 'Failed to fetch user details');
            }
        };
        getDiscountUserData();
    }, [setDiscountUserData]);

    return (
        <>
            <Grid container spacing={4}>
                {/* Section for User Data */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography variant="h5" sx={{ marginBottom: 2 }}>
                            Users Data
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow className="tableHeader">
                                        <TableCell className="tableCell">Name</TableCell>
                                        <TableCell className="tableCell">Total Items Purchased</TableCell>
                                        <TableCell className="tableCell">Total Amount Spent ($)</TableCell>
                                        <TableCell className="tableCell">Discount Codes</TableCell>
                                        <TableCell className="tableCell">Total Discount ($)</TableCell>
                                    </TableRow>
                                </TableHead>
                                {userData.length > 0 ? <TableBody>
                                    {userData.map((user) => (
                                        <TableRow key={user.user.id}>
                                            <TableCell>{user.user.name}</TableCell>
                                            <TableCell>{user.totalItemsPurchased}</TableCell>
                                            <TableCell>{user?.totalAmountSpent}</TableCell>
                                            <TableCell>
                                                {user.discountCodes.length > 0 ? (
                                                    user.discountCodes.map((code, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={code}
                                                            color="primary"
                                                            size="small"
                                                            sx={{ marginRight: 1 }}
                                                        />
                                                    ))
                                                ) : (
                                                    <Chip label="No Discount" color="default" size="small" />
                                                )}
                                            </TableCell>
                                            <TableCell>{user.totalDiscount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody> : <TableBody>No Data Found</TableBody>}

                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default AdminUserList;
