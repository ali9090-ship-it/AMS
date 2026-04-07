from flask import jsonify

class ApiResponse:
    @staticmethod
    def success(data=None, message="Operation successful", status=200):
        return jsonify({
            "success": True,
            "data": data,
            "message": message
        }), status

    @staticmethod
    def error(code="ERROR", message="An error occurred", status=400):
        return jsonify({
            "success": False,
            "error": code,
            "message": message
        }), status

    @staticmethod
    def unauthorized(message="Access denied"):
        return jsonify({
            "success": False,
            "error": "UNAUTHORIZED",
            "message": message
        }), 403

    @staticmethod
    def conflict(message="Record already exists"):
        return jsonify({
            "success": False,
            "error": "CONFLICT",
            "message": message
        }), 409
