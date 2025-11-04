class MtnException(Exception):
    pass


class MtnInvalidSetting(MtnException):
    def __init__(self, setting_name):
        super().__init__(f'Invalid value set for {setting_name}')


class MtnUnexpectedResponseStatus(MtnException):
    def __init__(self, response_status, expected_status):
        super().__init__(
            f'Unexpected response status: expected {expected_status}, but got {response_status}.'
        )


class MtnPaymentFailed(MtnException):
    def __init__(self, transaction_id, reason):
        super().__init__(f'Payment failed for transaction {transaction_id}: {reason}')


class MtnInsufficientBalance(MtnException):
    def __init__(self, available_balance, requested_amount):
        super().__init__(
            f'Insufficient balance: available {available_balance}, requested {requested_amount}'
        )