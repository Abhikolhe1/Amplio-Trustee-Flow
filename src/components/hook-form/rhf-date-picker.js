import PropTypes from "prop-types";

import { DatePicker } from "@mui/x-date-pickers";
import  { Controller, useFormContext } from "react-hook-form";


export default function RHFDatePicker({ name,label, ...others }) {
    
    const {control}=useFormContext();
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <DatePicker
                    {...field}
                    label={label}
                    value={field.value || null}
                    onChange={(newValue) => field.onChange(newValue)}
                    format="dd/MM/yyyy"
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            error: !!error,
                            helperText: error?.message,
                        },
                    }}
                    {...others}
                />
          
            )}
        />
        
    );
}

RHFDatePicker.propTypes={
    name:PropTypes.string,
    label:PropTypes.string
}