import { Controller, useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useState } from 'react';
import axiosInstance from 'src/utils/axios';
import { CustomUploadBox } from '../upload';

export default function RHFCustomFileUploadBox({
  name,
  multiple = false,
  maxSizeMB = 5,
  onRemove,
  onRemoveAll,
  ...other
}) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const { control, setValue, setError, clearErrors } = useFormContext();

  const handleFileDrop = async (fieldName, acceptedFiles, fileRejections = []) => {
    if (fileRejections.length > 0) {
      const firstError = fileRejections[0]?.errors?.[0];
      const rejectionMessage =
        firstError?.code === 'file-too-large'
          ? `Max file size is ${maxSizeMB} MB.`
          : firstError?.message || 'File is invalid. Please choose another file.';

      setUploadProgress(0);
      setError(fieldName, {
        type: 'manual',
        message: rejectionMessage,
      });
      return;
    }

    if (!acceptedFiles || acceptedFiles.length === 0) return;

    let fakeProgress = 0;
    setUploadProgress(0);
    clearErrors(fieldName);

    // Fake smooth progress
    const interval = setInterval(() => {
      fakeProgress += 5;
      if (fakeProgress <= 90) {
        setUploadProgress(fakeProgress);
      }
    }, 200);

    try {
      const formData = new FormData();
      if (multiple) {
        formData.append('files', acceptedFiles);
      } else {
        formData.append('file', acceptedFiles[0]);
      }

      const res = await axiosInstance.post('/files', formData);

      clearInterval(interval);
      setUploadProgress(100);

      if (multiple) {
        setValue(fieldName, res?.data?.files, {
          shouldValidate: true,
        });
      } else {
        setValue(fieldName, res?.data?.files?.[0], {
          shouldValidate: true,
        });
      }
      clearErrors(fieldName);
    } catch (error) {
      clearInterval(interval);
      setUploadProgress(0);
      setError(fieldName, {
        type: 'manual',
        message: 'Upload failed. Please try again.',
      });
    }
  };

  const handleRemoveFile = (fieldName) => {
    setUploadProgress(0);
    setValue(fieldName, null, { shouldValidate: true });
  };

  const handleRemoveAllFiles = (fieldName) => {
    setUploadProgress(0);
    setValue(fieldName, [], { shouldValidate: true });
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={multiple ? [] : null}
      render={({ field, fieldState: { error } }) =>
        multiple ? (
           <CustomUploadBox
            files={field.value || []}
            multiple
            maxSizeMB={maxSizeMB}
            uploadProgress={field.value && field.value?.length > 0 ? 100 : uploadProgress}
            error={!!error}
            helperText={error?.message}
            onRemove={() => (onRemove || handleRemoveFile)(name)}
            onRemoveAll={() => (onRemoveAll || handleRemoveAllFiles)(name)}
            onDrop={(acceptedFiles, fileRejections) => {
              handleFileDrop(name, acceptedFiles, fileRejections);
            }}
            {...other}
          />
        ) : (
          <CustomUploadBox
            file={field.value}
            maxSizeMB={maxSizeMB}
            uploadProgress={field.value ? 100 : uploadProgress}
            error={!!error}
            helperText={error?.message}
            onRemove={() => (onRemove || handleRemoveFile)(name)}
            onDrop={(acceptedFiles, fileRejections) => {
              handleFileDrop(name, acceptedFiles, fileRejections);
            }}
            {...other}
          />
        )
      }
    />
  );
}

// -----------------------------------------------------

RHFCustomFileUploadBox.propTypes = {
  name: PropTypes.string.isRequired,
  multiple: PropTypes.bool,
  maxSizeMB: PropTypes.number,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
};
