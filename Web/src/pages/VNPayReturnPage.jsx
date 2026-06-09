import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PAGES, API_BASE_URL } from '../utils/constants';
import { useAppointments } from '../contexts/AppointmentContext';

const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [debugInfo, setDebugInfo] = useState('');
  const hasFetched = useRef(false);
  const { refreshAppointments } = useAppointments();
  
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_Amount = searchParams.get('vnp_Amount');
  const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    // 1. Gửi request về Backend để xác thực chữ ký & cập nhật DB (Phòng hờ IPN lỗi)
    const verifyPayment = async () => {
      try {
        // QUAN TRỌNG: Phải dùng window.location.search nguyên bản (bỏ dấu ?)
        // Nếu dùng searchParams.toString() của React Router sẽ làm thay đổi mã hóa URL -> Sai chữ ký (Invalid Signature)
        const rawQueryStr = window.location.search.substring(1);
        
        const response = await fetch(`${API_BASE_URL}/payments/vnpay/vnpay-return?${rawQueryStr}`);
        const result = await response.json();
        
        // Kiểm tra xem Backend có xác thực chữ ký thành công không
        // RspCode '00' là thành công, '02' là Order already confirmed (Do React StrictMode gọi 2 lần)
        if (response.ok && (result.result?.RspCode === '00' || result.result?.RspCode === '02' || result.result?.RspCode === '99')) {
          if (vnp_ResponseCode === '00') {
            setStatus('success');
          } else {
            setStatus('failed');
            setDebugInfo(`Giao dịch thất bại. VNPAY trả về mã lỗi: ${vnp_ResponseCode}`);
          }
        } else {
          console.error("VNPAY Verification failed:", result);
          setStatus('failed');
          setDebugInfo(`Backend verify failed. RspCode: ${result?.result?.RspCode}, Message: ${result?.result?.Message}`);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('failed');
        setDebugInfo(`Lỗi mạng hoặc server không phản hồi: ${error.message}`);
      }
    };

    verifyPayment();
  }, [searchParams, vnp_ResponseCode]);

  const formattedAmount = vnp_Amount 
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(vnp_Amount) / 100)
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl transition-all duration-500 ease-in-out transform hover:scale-105">
        
        {status === 'processing' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
            <h2 className="text-2xl font-extrabold text-gray-900">Đang xử lý thanh toán</h2>
            <p className="mt-2 text-sm text-gray-600">Vui lòng chờ trong giây lát...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
              <svg className="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">Thanh toán thành công!</h2>
            
            <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Thông tin giao dịch:</p>
              <p className="text-md font-semibold text-gray-800">Mã: <span className="font-normal">{vnp_OrderInfo}</span></p>
              <p className="text-md font-semibold text-gray-800">Số tiền: <span className="text-green-600">{formattedAmount}</span></p>
            </div>

            <p className="mt-4 text-sm text-gray-600">Cảm ơn bạn đã sử dụng dịch vụ. Lịch hẹn của bạn đã được xác nhận.</p>
            
            <button
                  onClick={() => {
                  refreshAppointments();
                  navigate(PAGES.APPOINTMENTS);
                }}
                className="mt-8 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Về trang Lịch hẹn của tôi
              </button>
            <p className="mt-3 text-xs text-gray-400 italic">Nếu bạn thanh toán trên Mobile App, vui lòng quay lại App để tiếp tục.</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
              <svg className="h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Thanh toán thất bại</h2>
            
            <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left border border-gray-100">
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                Giao dịch của bạn đã bị từ chối hoặc có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.
              </p>
              {debugInfo && (
                <div className="bg-gray-100 p-3 rounded-lg mb-6 text-sm text-red-600 font-mono text-left break-all">
                  {debugInfo}
                </div>
              )}
              <p className="text-md font-semibold text-gray-800">Mã lỗi: <span className="font-normal">{vnp_ResponseCode || 'Không rõ'}</span></p>
            </div>
            
            <button
              onClick={() => {
                refreshAppointments();
                navigate(PAGES.APPOINTMENTS);
              }}
              className="mt-8 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Về trang Lịch hẹn của tôi
            </button>
            <p className="mt-3 text-xs text-gray-400 italic">Nếu bạn thanh toán trên Mobile App, vui lòng quay lại App để tiếp tục.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VNPayReturnPage;
