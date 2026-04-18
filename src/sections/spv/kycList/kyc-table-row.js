import PropTypes from 'prop-types';
import { format } from 'date-fns';
// @mui
// import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
// import Avatar from '@mui/material/Avatar';
// import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// import LinearProgress from '@mui/material/LinearProgress';
// // utils
// import { fCurrency } from 'src/utils/format-number';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
// import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function KycTableRow({
    row,
    selected,
    onSelectRow,
    onDeleteRow,
    onViewRow,
}) {
    const {
        id,
        applicationId,
        status,
        statusColor,
        createdAt,
    } = row;
    // console.log("row data",row);

    const confirm = useBoolean();

    // const popover = usePopover();

    return (
        <>
            <TableRow hover selected={selected}>
                {/* <TableCell padding="checkbox">
                    <Checkbox checked={selected} onClick={onSelectRow} />
                </TableCell> */}

                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                    <ListItemText
                        disableTypography
                        primary={
                            <Link
                                noWrap
                                color="inherit"
                                variant="subtitle2"
                                onClick={onViewRow}
                                sx={{ cursor: 'pointer' }}
                            >
                                {applicationId}
                            </Link>
                        }
                    />
                </TableCell>


                <TableCell>
                    <Label variant="soft" color={statusColor || 'default'}>
                        {status}
                    </Label>
                </TableCell>

                <TableCell>
                    <ListItemText
                        primary={format(new Date(createdAt), 'dd MMM yyyy')}
                        secondary={format(new Date(createdAt), 'p')}
                        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
                        secondaryTypographyProps={{
                            mt: 0.5,
                            component: 'span',
                            typography: 'caption',
                        }}
                    />
                </TableCell>

                <TableCell align="justify+">
                    <IconButton color={'default'} onClick={() => {
                        onViewRow();
                    }}>
                        <Iconify icon="solar:eye-bold" />
                    </IconButton>
                </TableCell>
            </TableRow>

            {/* <CustomPopover
                open={popover.open}
                onClose={popover.onClose}
                arrow="right-top"
                sx={{ width: 140 }}
            >
                <MenuItem
                    onClick={() => {
                        onViewRow();
                        popover.onClose();
                    }}
                >
                    <Iconify icon="solar:eye-bold" />
                    View
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        onEditRow();
                        popover.onClose();
                    }}
                >
                    <Iconify icon="solar:pen-bold" />
                    Edit
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        confirm.onTrue();
                        popover.onClose();
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                    Delete
                </MenuItem>
            </CustomPopover> */}

            <ConfirmDialog
                open={confirm.value}
                onClose={confirm.onFalse}
                title="Delete"
                content="Are you sure want to delete?"
                action={
                    <Button variant="contained" color="error" onClick={onDeleteRow}>
                        Delete
                    </Button>
                }
            />
        </>
    );
}

KycTableRow.propTypes = {
    onDeleteRow: PropTypes.func,
    onEditRow: PropTypes.func,
    onSelectRow: PropTypes.func,
    onViewRow: PropTypes.func,
    row: PropTypes.object,
    selected: PropTypes.bool,
};
