import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// _mock
import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import {
    useTable,
    getComparator,
    emptyRows,
    TableNoData,
    TableEmptyRows,
    TableHeadCustom,
    TableSelectedAction,
    TablePaginationCustom,
} from 'src/components/table';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//

import KycTableToolbar from '../kyc-table-toolbar';
import KycTableFiltersResult from '../kyc-table-filters-result';
import KycTableRow from '../kyc-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'applicationId', label: 'Application Id', width: 300 },
    { id: 'status', label: 'Status', width: 160 },
    { id: 'createdAt', label: 'Create at', width: 160 },
    { id: 'action', label: 'Action', width: 50 },
];

const PUBLISH_OPTIONS = [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
];

const defaultFilters = {
    name: '',
    publish: [],
    stock: [],
};

// ----------------------------------------------------------------------

export default function KycListView() {
    const router = useRouter();

    const table = useTable();

    const settings = useSettingsContext();

    const [tableData, setTableData] = useState([]);

    const [filters, setFilters] = useState(defaultFilters);

    //   const { products, productsLoading, productsEmpty } = useGetProducts();


    const confirm = useBoolean();

    useEffect(() => {
        const spvRows = getSpvRowsFromStorage();

        if (spvRows.length) {
            setTableData(spvRows);
        }
    }, []);

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(table.order, table.orderBy),
        filters,
    });

    const dataInPage = dataFiltered.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
    );

    const denseHeight = table.dense ? 60 : 80;

    const canReset = !isEqual(defaultFilters, filters);

    const notFound = (!dataFiltered.length && canReset)
    // || productsEmpty;

    const handleFilters = useCallback(
        (name, value) => {
            table.onResetPage();
            setFilters((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        },
        [table]
    );

    const handleDeleteRow = useCallback(
        (id) => {
            const deleteRow = tableData.filter((row) => row.id !== id);
            setTableData(deleteRow);

            table.onUpdatePageDeleteRow(dataInPage.length);
        },
        [dataInPage.length, table, tableData]
    );

    const handleDeleteRows = useCallback(() => {
        const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
        setTableData(deleteRows);

        table.onUpdatePageDeleteRows({
            totalRows: tableData.length,
            totalRowsInPage: dataInPage.length,
            totalRowsFiltered: dataFiltered.length,
        });
    }, [dataFiltered.length, dataInPage.length, table, tableData]);

    const handleEditRow = useCallback(
        (id) => {
            router.push(paths.dashboard.spvkyc.edit(id));
        },
        [router]
    );

    const handleViewRow = useCallback(
        (id) => {
            router.push(paths.dashboard.spvkyc.new);
        },
        [router]
    );

    const handleResetFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, []);



    return (
        <>
            <Container maxWidth={settings.themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="List"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        {
                            name: 'Spv Kyc',
                            href: paths.dashboard.spvkyc.root,
                        },
                        {
                            name: 'List',
                            href: paths.dashboard.spvkyc.list,
                        },
                    ]}
                   
                    action={
                        <Button
                            component={RouterLink}
                            color='primary'
                            href={paths.dashboard.spvkyc.new}
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            New Kyc
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Card>
                    <KycTableToolbar
                        filters={filters}
                        onFilters={handleFilters}
                        //
                        stockOptions={PRODUCT_STOCK_OPTIONS}
                        publishOptions={PUBLISH_OPTIONS}
                    />

                    {canReset && (
                        <KycTableFiltersResult
                            filters={filters}
                            onFilters={handleFilters}
                            //
                            onResetFilters={handleResetFilters}
                            //
                            results={dataFiltered.length}
                            sx={{ p: 2.5, pt: 0 }}
                        />
                    )}

                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        <TableSelectedAction
                            dense={table.dense}
                            numSelected={table.selected.length}
                            rowCount={tableData.length}
                            onSelectAllRows={(checked) =>
                                table.onSelectAllRows(
                                    checked,
                                    tableData.map((row) => row.id)
                                )
                            }
                            action={
                                <Tooltip title="Delete">
                                    <IconButton color="primary" onClick={confirm.onTrue}>
                                        <Iconify icon="solar:trash-bin-trash-bold" />
                                    </IconButton>
                                </Tooltip>
                            }
                        />

                        <Scrollbar>
                            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                                <TableHeadCustom
                                    order={table.order}
                                    orderBy={table.orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={tableData.length}
                                    numSelected={table.selected.length}
                                    onSort={table.onSort}
                                    onSelectAllRows={(checked) =>
                                        table.onSelectAllRows(
                                            checked,
                                            tableData.map((row) => row.id)
                                        )
                                    }
                                />

                                <TableBody>
                                    {/* {productsLoading ? (
                    [...Array(table.rowsPerPage)].map((i, index) => (
                      <TableSkeleton key={index} sx={{ height: denseHeight }} />
                    ))
                  ) : (
                    <> */}
                                    {dataFiltered
                                        .slice(
                                            table.page * table.rowsPerPage,
                                            table.page * table.rowsPerPage + table.rowsPerPage
                                        )
                                        .map((row) => (
                                            <KycTableRow
                                                key={row.id}
                                                row={row}
                                                selected={table.selected.includes(row.id)}
                                                onSelectRow={() => table.onSelectRow(row.id)}
                                                onDeleteRow={() => handleDeleteRow(row.id)}
                                                onEditRow={() => handleEditRow(row.id)}
                                                onViewRow={() => handleViewRow(row.id)}
                                            />
                                        ))}
                                    {/* </>
                  )} */}

                                    <TableEmptyRows
                                        height={denseHeight}
                                        emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                                    />

                                    <TableNoData notFound={notFound} />
                                </TableBody>
                            </Table>
                        </Scrollbar>
                    </TableContainer>

                    <TablePaginationCustom
                        count={dataFiltered.length}
                        page={table.page}
                        rowsPerPage={table.rowsPerPage}
                        onPageChange={table.onChangePage}
                        onRowsPerPageChange={table.onChangeRowsPerPage}
                        //
                        dense={table.dense}
                        onChangeDense={table.onChangeDense}
                    />
                </Card>
            </Container>

            <ConfirmDialog
                open={confirm.value}
                onClose={confirm.onFalse}
                title="Delete"
                content={
                    <>
                        Are you sure want to delete <strong> {table.selected.length} </strong> items?
                    </>
                }
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            handleDeleteRows();
                            confirm.onFalse();
                        }}
                    >
                        Delete
                    </Button>
                }
            />
        </>
    );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
    const { name } = filters;

    const stabilizedThis = inputData.map((el, index) => [el, index]);
  
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (name) {
        inputData = inputData.filter(
            (product) => product.applicationId.toLowerCase().indexOf(name.toLowerCase()) !== -1
        );
    }

    // if (stock.length) {
    //     inputData = inputData.filter((product) => stock.includes(product.inventoryType));
    // }

    // if (publish.length) {
    //     inputData = inputData.filter((product) => publish.includes(product.publish));
    // }

    return inputData;
}

function getSpvRowsFromStorage() {
    try {
        const savedForm = localStorage.getItem('formData');
        const savedStep = localStorage.getItem('activeStepId');
        const savedProgress = localStorage.getItem('stepsProgress');

        if (!savedForm) {
            return [];
        }

        const formData = JSON.parse(savedForm);
        const stepsProgress = savedProgress ? JSON.parse(savedProgress) : {};

        if (!formData || typeof formData !== 'object') {
            return [];
        }

        const applicationId = formData?.basic_info?.spvName || 'SPV Application';

        return [
            {
                id: applicationId,
                applicationId,
                status: getSpvStatus(savedStep, stepsProgress),
                createdAt: getSpvCreatedAt(formData),
                action: 'View',
            },
        ];
    } catch (error) {
        console.error('Unable to read SPV KYC data from localStorage', error);
        return [];
    }
}

function getSpvStatus(activeStepId, stepsProgress = {}) {
    if (activeStepId === 'review_Activate' && stepsProgress?.review_Activate?.percent === 100) {
        return 'Completed';
    }

    const hasStarted = Object.values(stepsProgress).some((step) => Number(step?.percent) > 0);

    return hasStarted ? 'In Progress' : 'Pending';
}

function getSpvCreatedAt(formData) {
    const possibleDates = [
        formData?.basic_info?.createdAt,
        formData?.pool_financial?.createdAt,
        formData?.ptc_parameters?.createdAt,
        formData?.legal_structure?.createdAt,
        formData?.escrow_setup?.createdAt,
        formData?.credit_rating?.applicationDate,
        formData?.isin_application?.issueDate,
    ].filter(Boolean);

    return possibleDates[0] || new Date().toISOString();
}
