import { Upload, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/** 无需使用此组件。 */
function fileInputer(props) {

    const [fileList, setFileList] = useState([])

    return (
        <Upload {...props} beforeUpload={props.beforeUpload} accept={props.accept} >
            <Button icon={<UploadOutlined />}>点击上传图片</Button>
        </Upload>
    );
}


export default fileInputer;