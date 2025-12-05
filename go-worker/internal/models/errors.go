package models

import "errors"

var (
	ErrInvalidLocation    = errors.New("location is required")
	ErrInvalidSource      = errors.New("source is required")
	ErrInvalidTemperature = errors.New("temperature must be between -100 and 100")
	ErrInvalidHumidity    = errors.New("humidity must be between 0 and 100")
	ErrInvalidTimestamp   = errors.New("timestamp is required")
)

